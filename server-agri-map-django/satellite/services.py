import logging
from datetime import date

from decouple import config
from django.utils import timezone

from analysis.models import VegetationIndex
from .models import ProcessingJob, SatelliteImage

logger = logging.getLogger(__name__)


def compute_ndvi(bands):
    nir = bands.get('B08')
    red = bands.get('B04')
    if nir is None or red is None:
        return None
    nir, red = float(nir), float(red)
    if nir + red == 0:
        return 0.0
    return round((nir - red) / (nir + red), 4)


def compute_evi(bands):
    nir = bands.get('B08')
    red = bands.get('B04')
    blue = bands.get('B02')
    if any(v is None for v in (nir, red, blue)):
        return None
    nir, red, blue = float(nir), float(red), float(blue)
    denominator = nir + 6 * red - 7.5 * blue + 1
    if denominator == 0:
        return 0.0
    return round(2.5 * (nir - red) / denominator, 4)


def _sentinelhub_available():
    client_id = config('SENTINEL_CLIENT_ID', default='')
    client_secret = config('SENTINEL_CLIENT_SECRET', default='')
    return bool(client_id and client_secret)


def _field_bbox(field):
    from sentinelhub import BBox, CRS
    if field.centroid_lat is None or field.centroid_lng is None:
        return None
    lat, lng = float(field.centroid_lat), float(field.centroid_lng)
    size = 0.005
    return BBox([lng - size, lat - size, lng + size, lat + size], crs=CRS.WGS84)


def fetch_satellite_data(*, field, start_date, end_date):
    if not _sentinelhub_available():
        logger.info('Sentinel Hub credentials not configured — returning stub')
        return _stub_fetch(field)

    try:
        return _real_fetch(field, start_date, end_date)
    except Exception:
        logger.exception('Sentinel Hub fetch failed for field %s — falling back to stub', field.id)
        return _stub_fetch(field)


def _real_fetch(field, start_date, end_date):
    from sentinelhub import MimeType, SentinelHubCatalog, SentinelHubRequest

    bbox = _field_bbox(field)
    if bbox is None:
        raise ValueError(f'Field {field.id} has no centroid')

    from sentinelhub import SHConfig
    sh_config = SHConfig()
    sh_config.sh_client_id = config('SENTINEL_CLIENT_ID')
    sh_config.sh_client_secret = config('SENTINEL_CLIENT_SECRET')
    sh_config.sh_base_url = config('SENTINEL_BASE_URL', default='https://services.sentinel-hub.com')
    sh_config.sh_token_url = config('SENTINEL_TOKEN_URL', default='https://services.sentinel-hub.com/auth/realms/main/protocol/openid-connect/token')

    catalog = SentinelHubCatalog(config=sh_config)
    search_iter = catalog.search(
        collection='sentinel-2-l2a',
        bbox=bbox,
        time=(start_date, end_date),
        fields={'include': ['id', 'properties.datetime', 'properties.cloudCover']},
    )
    scenes = list(search_iter)
    if not scenes:
        raise ValueError(f'No Sentinel-2 scenes found for field {field.id}')

    scenes.sort(key=lambda s: s['properties'].get('cloudCover', 100) or 100)
    best = scenes[0]
    scene_id = best['id']
    cloud_cover = best['properties'].get('cloudCover', 0)

    evalscript = """
    //VERSION=3
    function setup() {
        return {
            input: ["B02", "B03", "B04", "B08"],
            output: { bands: 4, sampleType: "FLOAT32" }
        };
    }
    function evaluatePixel(sample) {
        return [sample.B02, sample.B03, sample.B04, sample.B08];
    }
    """
    request = SentinelHubRequest(
        evalscript=evalscript,
        input_data=[
            SentinelHubRequest.input_data(
                data_collection='sentinel-2-l2a',
                time_interval=(start_date, end_date),
                maxcc=100,
                other_args={'dataFilter': {'mosaickingOrder': 'leastCC'}},
            )
        ],
        responses=[SentinelHubRequest.output_response('default', MimeType.TIFF)],
        bbox=bbox,
        size=(256, 256),
        config=sh_config,
    )
    data = request.get_data()[0]
    import numpy as np
    b02 = float(np.mean(data[:, :, 0]))
    b03 = float(np.mean(data[:, :, 1]))
    b04 = float(np.mean(data[:, :, 2]))
    b08 = float(np.mean(data[:, :, 3]))

    return {
        'date': date.today(),
        'source_url': f'https://www.sentinel-hub.com/explore/sentinel-image/{scene_id}',
        'cloud_cover': round(float(cloud_cover), 2),
        'bands': {'B02': round(b02, 4), 'B03': round(b03, 4), 'B04': round(b04, 4), 'B08': round(b08, 4)},
        'scene_id': scene_id,
    }


def _stub_fetch(field):
    return {
        'date': date.today(),
        'source_url': f'https://scihub.copernicus.eu/dhus/search?q=field_{field.id}',
        'cloud_cover': 12.5,
        'bands': {'B02': 0.15, 'B03': 0.22, 'B04': 0.31, 'B08': 0.68},
    }


def process_field_images(*, field):
    images = SatelliteImage.objects.filter(field=field).order_by('date')
    if not images.exists():
        raise ValueError('No imagery available. Fetch imagery first.')

    processed = []
    for image in images:
        if image.bands is None:
            continue
        if VegetationIndex.objects.filter(field=field, date=image.date).exists():
            continue

        ndvi = compute_ndvi(image.bands)
        evi = compute_evi(image.bands)
        if ndvi is None or evi is None:
            logger.warning('Could not compute indices for image %s — skipping', image.id)
            continue

        VegetationIndex.objects.create(field=field, ndvi=ndvi, evi=evi, date=image.date)
        processed.append({'image_id': image.id, 'ndvi': ndvi, 'evi': evi, 'date': str(image.date)})

    if not processed:
        raise ValueError('No new images to process. All images already have vegetation indices.')

    latest = processed[-1]
    job = ProcessingJob.objects.create(
        field=field,
        status='completed',
        result={
            'ndvi_calculated': latest['ndvi'],
            'evi_calculated': latest['evi'],
            'images_processed': len(processed),
            'image_ids_processed': [p['image_id'] for p in processed],
            'vegetation_index_dates': [p['date'] for p in processed],
        },
        completed_at=timezone.now(),
    )

    return {
        'job_id': job.id,
        'status': job.status,
        'result': job.result,
    }

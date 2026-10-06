# AgriMap Django Backend

Django REST Framework service for AgriMap's farmer and cooperative records, field geometry, satellite imagery workflow, agricultural analysis, soil and carbon records, and field reports. The backend lives in this directory; the repository root README describes the complete multi-service project.

## Contents

- [What the backend does](#what-the-backend-does)
- [Architecture and data model](#architecture-and-data-model)
- [Run locally](#run-locally)
- [Configuration](#configuration)
- [API conventions](#api-conventions)
- [Endpoint reference](#endpoint-reference)
- [ML behavior and data limitations](#ml-behavior-and-data-limitations)
- [Security and access](#security-and-access)
- [Operations and deployment](#operations-and-deployment)

## What the backend does

- Stores farmer profiles, cooperatives, cooperative memberships, and farm fields.
- Accepts GeoJSON field geometries, calculates a simple centroid, supports bounding-box list filtering, and serves a GeoJSON FeatureCollection.
- Fetches Sentinel-2 L2A band summaries when Sentinel Hub credentials are configured; otherwise the current service returns simulated imagery values.
- Calculates NDVI and EVI from stored band summaries and records processing jobs.
- Exposes crop recommendation, crop-area identification, and soil composition prediction endpoints backed by serialized model assets or fallback estimates.
- Reads soil-health, land-degradation, boundary, and carbon records, and builds an aggregate field report.
- Publishes an OpenAPI schema and Swagger UI.

## Architecture and data model

The project is split into Django apps: `accounts` (user serializers, not currently wired to routes), `farmers`, `fields`, `satellite`, `analysis`, `soil`, `carbon`, `reports`, and `ml`. Django REST Framework provides the API; PostgreSQL is the configured database. Data relationships are centered on `Field`: images, vegetation indices, predictions, soil records, carbon records, degradation and boundary data, and reports all reference a field. Farmer records reference Django users; cooperative memberships connect a cooperative to a farmer profile.

`Field.geometry` is stored as JSON GeoJSON rather than a PostGIS geometry column. Accepted geometry types are Point, MultiPoint, LineString, MultiLineString, Polygon, MultiPolygon, and GeometryCollection. The field centroid is calculated from coordinate bounds (or directly from Point coordinates); this is a bounding-box midpoint, not a geodesic polygon centroid. The optional `area_ha` is supplied by the caller and is not calculated by the API.

## Run locally

From this directory, use Python 3.10+ and a PostgreSQL database reachable by `DATABASE_URL` (the default is `postgres://postgres:postgres@localhost:5432/agrimap`). Install dependencies, apply migrations, and start Django:

```bash
python -m venv .venv
# Windows PowerShell: .venv\Scripts\Activate.ps1
# macOS/Linux: source .venv/bin/activate
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8002
```

The default `manage.py` settings module is `server_agri_map_django.settings.local`. The API base is `http://localhost:8002/api/`; browsable DRF pages are enabled in local settings. The server is not configured to create a SQLite database automatically.

The deployment startup script runs migrations and `collectstatic`, then starts Gunicorn. The project includes a `seed_data` management command for sample data; inspect its options with `python manage.py seed_data --help`.

## Configuration

Settings read environment variables using `python-decouple` (environment variables or a `.env` file in the project root):

| Variable | Purpose |
|---|---|
| `SECRET_KEY` | Django secret key; required. |
| `DEBUG` | Debug mode; defaults to false in base settings. |
| `ALLOWED_HOSTS` | Comma-separated hosts; local defaults are localhost and 127.0.0.1. |
| `DATABASE_URL` | PostgreSQL connection URL; defaults to local `agrimap` database. |
| `CORS_ALLOWED_ORIGINS` | Comma-separated browser origins; local defaults include client/dev ports. |
| `SENTINEL_CLIENT_ID`, `SENTINEL_CLIENT_SECRET` | Enable Sentinel Hub catalog and imagery requests. Missing credentials select the simulated imagery path. |
| `SENTINEL_BASE_URL`, `SENTINEL_TOKEN_URL` | Optional Sentinel Hub service endpoints. |
| `PORT`, `GUNICORN_WORKERS` | Deployment bind port and worker count (startup defaults: 8002 and 4). |

Production settings add HTTPS redirects, secure cookies, HSTS, Render host defaults, and WhiteNoise compressed static files. Set a strong `SECRET_KEY` and the correct database/origin values in deployment configuration.

## API conventions

All routes are under `/api/` except Django admin (`/admin/`). JSON request bodies should use `Content-Type: application/json`. DRF page-number pagination is enabled globally with a page size of 50, so list endpoints normally return `{ "count": ..., "next": ..., "previous": ..., "results": [...] }`. Validation errors generally return HTTP 400; missing records return 404; successful creates return 201; deletes return 204.

No endpoint currently requires a bearer token: the global DRF permission is `AllowAny`, authentication classes are empty, and `resolve_user()` assigns writes to one shared `open-access` Django user. Although account serializers exist and Simple JWT is installed, there are no auth URL routes in the root URL configuration. See [Security and access](#security-and-access).

## Endpoint reference

Replace `{base}` with `http://localhost:8002` (or the deployed service URL). All paths below include the `/api` prefix.

### Health, schema, and admin

| Method | Path | Behavior |
|---|---|---|
| GET | `/api/health/` | Reports `status`, API version, and database connectivity. HTTP 200 can report `degraded` when the database is unreachable. |
| GET | `/api/schema/` | OpenAPI schema (JSON/YAML negotiated by DRF; `?format=json` is useful for clients). |
| GET | `/api/docs/` | Swagger UI for the schema. |
| — | `/admin/` | Django admin site; requires a Django staff account. |

### Farmers and cooperatives

| Method | Path | Behavior |
|---|---|---|
| POST | `/api/farmers/register/` | Creates a farmer profile for the shared open-access user. Body: `{ "phone": "+254…", "location": "…" }`. It does not create a Django login. |
| GET, PUT, PATCH | `/api/farmers/me/` | Gets or updates that shared user's farmer profile; GET creates an empty profile if none exists. Writable profile fields: `phone`, `location`. |
| GET, POST | `/api/farmers/cooperatives/` | Lists cooperatives or creates one. Create body: `{ "name": "…", "description": "…", "location": "…" }`; creator is assigned automatically. |
| GET | `/api/farmers/cooperatives/{id}/` | Retrieves a cooperative and computed `member_count`. |
| GET, POST | `/api/farmers/cooperatives/{id}/members/` | Lists or adds members. Create body requires `user_id`; optional `role` is `admin` or `member`. The user must already have a farmer profile. Duplicate membership returns 400. |
| GET, PUT, PATCH, DELETE | `/api/farmers/cooperatives/{id}/members/{member_id}/` | Retrieves, changes role, or removes a membership. |

### Fields

| Method | Path | Behavior |
|---|---|---|
| GET, POST | `/api/fields/` | Lists fields or creates one. Create body example: `{ "name": "North plot", "geometry": { "type": "Polygon", "coordinates": [[[36.8,-1.2],[36.81,-1.2],[36.81,-1.21],[36.8,-1.21],[36.8,-1.2]]] }, "area_ha": 1.2 }`. The response includes computed `centroid_lat` and `centroid_lng`. |
| GET | `/api/fields/?bbox={west},{south},{east},{north}` | Filters the list by stored centroid within the longitude/latitude bounds. Invalid bbox values return 400. |
| GET | `/api/fields/geojson/` | Returns all fields as a GeoJSON FeatureCollection. |
| GET, PUT, PATCH, DELETE | `/api/fields/{id}/` | Retrieves, edits, or deletes a field. |

### Satellite imagery

| Method | Path | Behavior |
|---|---|---|
| POST | `/api/satellite/fetch/` | Fetches or simulates imagery for a field and stores a SatelliteImage. Body: `{ "field_id": 1, "date_range": ["2026-01-01", "2026-09-30"] }`; `date_range` is optional. Returns image id, date, source URL, cloud cover, B02/B03/B04/B08 band values, and selected date range. Unknown field returns 404. |
| POST | `/api/satellite/process/` | Processes stored images for a field. Body: `{ "field_id": 1 }`. Calculates NDVI/EVI, stores VegetationIndex records, and creates a completed ProcessingJob. Returns 400 when there are no images or no new images to process. |
| GET, POST | `/api/satellite/images/` | Lists stored imagery or directly creates a SatelliteImage with `field`, `date`, and optional `source_url`, `cloud_cover`, `bands`. |
| GET, DELETE | `/api/satellite/images/{id}/` | Retrieves or deletes a stored image. |
| GET | `/api/satellite/jobs/` | Lists processing jobs. |
| GET | `/api/satellite/jobs/{id}/` | Retrieves a processing job. |

For real fetches, the service searches Sentinel-2 L2A scenes for a 0.005-degree box around the field centroid, chooses the scene with the lowest cloud cover, downloads a 256x256 band response, and stores mean band values. If credentials are absent it returns fixed simulated values; runtime errors also fall back to that stub. These paths should not be treated as equivalent evidence of real satellite observations.

### Analysis

ML POST requests accept numerical inputs `nitrogen`, `phosphorus`, `potassium`, `temperature`, `humidity`, `rainfall`, `moisture`, `lon`, and `lat`; all have defaults, so `{}` is accepted. Soil and crop-area requests also accept optional categorical `soil_type`, `region`, and `country`. Values are range validated by serializers.

| Method | Path | Behavior |
|---|---|---|
| GET | `/api/analysis/vegetation/{field_id}/` | Returns up to 10 newest stored NDVI/EVI values; an empty list is valid. |
| POST | `/api/analysis/crop-type/{field_id}/` | Returns crop recommendation, confidence, reliability level, and message. |
| POST | `/api/analysis/soil-composition/{field_id}/` | Returns estimated soil type, confidence, reliability, and message. |
| POST | `/api/analysis/crop-area/{field_id}/` | Returns crop-area/crop identification prediction, confidence, reliability, and message. |
| GET | `/api/analysis/boundaries/{field_id}/` | Returns the first stored boundary GeoJSON record; 404 if none exists. |
| GET | `/api/analysis/trends/{field_id}/` | Returns dated NDVI/EVI series and simple `declining` or `stable` status; 404 if no indices exist. |
| GET | `/api/analysis/degradation/{field_id}/` | Returns the first stored degradation severity and score; 404 if absent. |

Example ML request:

```json
{
  "nitrogen": 80,
  "phosphorus": 40,
  "potassium": 40,
  "temperature": 25,
  "humidity": 70,
  "rainfall": 200,
  "moisture": 40,
  "lon": 36.8,
  "lat": -1.2,
  "soil_type": "Loamy",
  "region": "Central",
  "country": "Kenya"
}
```

### Soil, carbon, and reports

| Method | Path | Behavior |
|---|---|---|
| GET | `/api/soil/{field_id}/` | Returns the newest SoilHealthRecord: nitrogen proxy, moisture index, degradation risk, timestamp. A record must already exist; otherwise 404. |
| GET | `/api/carbon/{field_id}/` | Returns the newest carbon record: `carbon_tons`, `confidence_score`, `methodology`, and timestamp. Returns 404 if no record exists. |
| POST | `/api/carbon/{field_id}/create/` | Creates a carbon record. Body: `{ "carbon_tons": 2.3, "confidence_score": 0.87, "methodology": "ndvi_based" }`; allowed methodologies are `ndvi_based`, `soil_organic_carbon`, `biomass_estimation`. |
| GET | `/api/reports/field/{field_id}/` | Returns a saved FieldReport JSON if present; otherwise composes a response from the latest crop, soil, carbon, and vegetation records, using null sections when data is absent. |

## ML behavior and data limitations

Model files live in `ml/model_assets/` and are loaded lazily. Crop recommendation and crop-area prediction use their bundled model, preprocessor, and label encoder when they load successfully. If unavailable, crop recommendation may return a previously saved crop record or a fixed `apple` estimate at 0.85 confidence; crop-area returns a fixed `Maize` estimate at 0.70. Soil prediction is currently a fixed `Loamy` estimate at 0.60 because a trained soil classifier is not implemented. Reliability labels use the configured thresholds: High above 0.85, Medium from 0.60 through 0.85, otherwise Low.

The prediction endpoints persist crop and crop-area predictions only when the trained model path runs. Soil-health, boundary, degradation, and carbon are database-backed read/create records; no automatic calculation pipeline populates all of them. The report endpoint aggregates existing rows; it does not run the analysis pipeline. Treat estimates and confidence as application outputs, not independently validated agronomic advice.

## Security and access

The current API deliberately has no effective per-user authorization: DRF defaults to `AllowAny`, authentication classes are empty, and `resolve_user()` returns the same `open-access` user for writes. Field and cooperative querysets are not owner-filtered; cooperative admin checks are currently no-ops. As a result, endpoints can read and modify shared records without login. Do not expose this configuration to sensitive or production user data until authentication, ownership filtering, and role checks are implemented and configured. The installed Simple JWT package and account serializers do not make auth routes available by themselves.

CORS is controlled by `CORS_ALLOWED_ORIGINS`. CORS is a browser policy and does not provide API authorization.

## Operations and deployment

- Apply schema changes with `python manage.py migrate`.
- Production settings are in `server_agri_map_django.settings.production`; local `manage.py` defaults to `...settings.local`.
- `startup.sh` migrates and collects static files before launching Gunicorn.
- Static assets are served through WhiteNoise in production.
- DRF list responses are paginated at 50 rows by default.
- API schema and Swagger are exposed at `/api/schema/` and `/api/docs/`.
- Run app tests with `python manage.py test` (Django discovers each app's `tests.py`).

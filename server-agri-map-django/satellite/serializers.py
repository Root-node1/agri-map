from rest_framework import serializers

from .models import ProcessingJob, SatelliteImage


class FetchImageryInputSerializer(serializers.Serializer):
    field_id = serializers.IntegerField()
    date_range = serializers.ListField(
        child=serializers.CharField(), required=False, default=list,
    )


class _BandsSerializer(serializers.Serializer):
    B02 = serializers.FloatField()
    B03 = serializers.FloatField()
    B04 = serializers.FloatField()
    B08 = serializers.FloatField()


class _DateRangeSerializer(serializers.Serializer):
    start = serializers.CharField()
    end = serializers.CharField()


class FetchImageryResponseSerializer(serializers.Serializer):
    field_id = serializers.IntegerField()
    image_id = serializers.IntegerField()
    date = serializers.DateField()
    source_url = serializers.URLField()
    cloud_cover = serializers.FloatField()
    bands = _BandsSerializer()
    date_range = _DateRangeSerializer()


class ProcessImageryInputSerializer(serializers.Serializer):
    field_id = serializers.IntegerField()


class _ProcessResultSerializer(serializers.Serializer):
    cloud_masking = serializers.CharField()
    bands_extracted = serializers.ListField(child=serializers.CharField())
    ndvi_calculated = serializers.FloatField()
    evi_calculated = serializers.FloatField()
    images_processed = serializers.IntegerField()


class ProcessImageryResponseSerializer(serializers.Serializer):
    job_id = serializers.IntegerField()
    status = serializers.CharField()
    result = _ProcessResultSerializer()


class SatelliteImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = SatelliteImage
        fields = '__all__'
        read_only_fields = ('id', 'ingested_at')


class ProcessingJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProcessingJob
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'completed_at')

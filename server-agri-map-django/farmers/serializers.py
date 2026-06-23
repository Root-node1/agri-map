from rest_framework import serializers

from .models import Cooperative, CooperativeMember, Farmer


class FarmerSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Farmer
        fields = ('id', 'username', 'email', 'phone', 'location', 'created_at')


class CooperativeSerializer(serializers.ModelSerializer):
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Cooperative
        fields = ('id', 'name', 'description', 'location', 'created_by', 'member_count', 'created_at')
        read_only_fields = ('created_by',)

    def get_member_count(self, obj) -> int:
        return obj.members.count()


class CooperativeMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = CooperativeMember
        fields = ('id', 'cooperative', 'farmer', 'role', 'joined_at')

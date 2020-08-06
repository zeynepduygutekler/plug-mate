from rest_framework import serializers
from .models import RemoteData, ScheduleData, PresenceData

class RemoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = RemoteData
        fields = ('id', 'user_id', 'device_type', 'device_state')

class ScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScheduleData
        fields = ('id', 'user_id', 'event_id', 'event_start', 'event_end', 'event_name', 'event_rrule', 'device_type_id', 'device_type')

class PresenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = PresenceData
        fields = ('id', 'user_id', 'device_type', 'presence_setting')



from rest_framework import serializers
from .models import RemoteData, ScheduleData, PresenceData, \
    AchievementsBonus, AchievementsWeekly, PointsWallet, \
    Notifications

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

class AchievementsBonusSerializer(serializers.ModelSerializer):
    class Meta:
        model = AchievementsBonus
        fields = ('id', 'user_id', 'tree_first', 'tree_fifth', 'tree_tenth', 'redeem_reward', 'first_remote', 'first_schedule', 'first_presence', 'cum_savings')

class AchievementsWeeklySerializer(serializers.ModelSerializer):
    class Meta:
        model = AchievementsWeekly
        fields = ('id', 'user_id', 'cost_saving', 'schedule_based', 'complete_daily', 'complete_weekly')

class PointsWalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = PointsWallet
        fields = ('id', 'user_id', 'points')

class NotificationsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notifications
        fields = ('id', 'user_id', 'notifications')
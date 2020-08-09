from django.db import models
from django.contrib.auth.models import User
from django.db import models

class Users(models.Model):
    user_id = models.IntegerField(primary_key=True)
    user_name = models.CharField(max_length=255)
    mac_address = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = 'users'

    def get_user_name(self):
        return self.user_name


class UserProfileInfo(models.Model):

    # Create relationship (don't inherit from User!)
    user = models.OneToOneField(User, on_delete=models.DO_NOTHING)

    # Add any additional attributes you want
    # user_id_field = models.ForeignKey(Users, on_delete=models.DO_NOTHING, related_name='user_id_profile')

    def __str__(self):
        # Built-in attribute of django.contrib.auth.models.User !
        return self.user.username


class Meters(models.Model):
    meter_id = models.IntegerField(primary_key=True)
    meter_name = models.CharField(max_length=255)
    user = models.ForeignKey(Users, models.DO_NOTHING, related_name='user_id_meters')

    class Meta:
        managed = False
        db_table = 'meters'


class PowerEnergyConsumption(models.Model):
    date = models.DateField()
    time = models.TimeField()
    unix_time = models.BigIntegerField()
    meter = models.ForeignKey(Meters, models.DO_NOTHING, related_name='meter_id_power')
    user = models.ForeignKey(Users, models.DO_NOTHING, related_name='user_id_power')
    energy = models.FloatField()
    power = models.FloatField()
    device_state = models.IntegerField()
    device_type = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = 'power_energy_consumption'


class Presence(models.Model):
    date = models.DateField()
    time = models.TimeField()
    unix_time = models.BigIntegerField()
    user = models.ForeignKey(Users, models.DO_NOTHING, related_name='user_id_presence')
    rssi = models.FloatField()
    presence = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'presence'


class PointsWallet(models.Model):
    user = models.IntegerField(primary_key=True)
    points = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'points_wallet'

    def __str__(self):
        return self.points


class RemoteData(models.Model):
    user_id = models.IntegerField()
    device_type = models.CharField(max_length=100)
    device_state = models.BooleanField()


class ScheduleData(models.Model):
    user_id = models.IntegerField()
    event_id = models.IntegerField()
    event_start = models.CharField(max_length=100)
    event_end = models.CharField(max_length=100)
    event_name = models.CharField(max_length=100)
    event_rrule = models.CharField(max_length=100)
    device_type_id = models.IntegerField()
    device_type = models.CharField(max_length=100)


class PresenceData(models.Model):
    user_id = models.IntegerField()
    device_type = models.CharField(max_length=100)
    presence_setting = models.IntegerField()


class AchievementsBonus(models.Model):
    user_id = models.IntegerField()
    tree_first = models.BooleanField()
    tree_fifth = models.BooleanField()
    tree_tenth = models.BooleanField()
    redeem_reward = models.BooleanField()
    first_remote = models.BooleanField()
    first_schedule = models.BooleanField()
    first_presence = models.BooleanField()

    class Meta:
        db_table = 'achievements_bonus'
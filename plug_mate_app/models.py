from django.db import models
from django.contrib.auth.models import User

# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models

class Users(models.Model):
    user_id = models.IntegerField(primary_key=True)
    user_name = models.CharField(max_length=255)
    mac_address = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = 'users'


class UserProfileInfo(models.Model):

    # Create relationship (don't inherit from User!)
    user = models.OneToOneField(User, on_delete=models.DO_NOTHING)

    # Add any additional attributes you want
    user_id_field = models.ForeignKey(Users, on_delete=models.DO_NOTHING, related_name='user_id_profile')

    def __str__(self):
        # Built-in attribute of django.contrib.auth.models.User !
        return self.user.username


class Meters(models.Model):
    meter_id = models.IntegerField(primary_key=True)
    meter_name = models.CharField(max_length=255)
    user = models.ForeignKey(Users, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'meters'


class PowerEnergyConsumption(models.Model):
    date = models.DateField()
    time = models.TimeField()
    unix_time = models.BigIntegerField()
    meter = models.ForeignKey(Meters, models.DO_NOTHING)
    user = models.ForeignKey(Users, models.DO_NOTHING)
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
    user = models.ForeignKey(Users, models.DO_NOTHING)
    rssi = models.FloatField()
    presence = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'presence'




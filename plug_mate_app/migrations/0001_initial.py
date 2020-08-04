from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Meters',
            fields=[
                ('meter_id', models.IntegerField(primary_key=True, serialize=False)),
                ('meter_name', models.CharField(max_length=255)),
            ],
            options={
                'db_table': 'meters',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='PointsWallet',
            fields=[
                ('user', models.IntegerField(primary_key=True, serialize=False)),
                ('points', models.IntegerField()),
            ],
            options={
                'db_table': 'points_wallet',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='PowerEnergyConsumption',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('time', models.TimeField()),
                ('unix_time', models.BigIntegerField()),
                ('energy', models.FloatField()),
                ('power', models.FloatField()),
                ('device_state', models.IntegerField()),
                ('device_type', models.CharField(max_length=255)),
            ],
            options={
                'db_table': 'power_energy_consumption',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='Presence',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('time', models.TimeField()),
                ('unix_time', models.BigIntegerField()),
                ('rssi', models.FloatField()),
                ('presence', models.IntegerField()),
            ],
            options={
                'db_table': 'presence',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='Users',
            fields=[
                ('user_id', models.IntegerField(primary_key=True, serialize=False)),
                ('user_name', models.CharField(max_length=255)),
                ('mac_address', models.CharField(max_length=255)),
            ],
            options={
                'db_table': 'users',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='UserProfileInfo',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.DO_NOTHING, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]

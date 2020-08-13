from django.shortcuts import render
from plotly.offline import plot
import plotly.graph_objects as go
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponseRedirect, HttpResponse
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from rest_framework import viewsets, authentication
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from . import serializers
from .models import Users, PowerEnergyConsumption, PointsWallet, Meters
from django.db import connection
from time import localtime, strftime
import os
import pandas as pd


def plug_mate_app(request):
    if request.user.is_authenticated:
        with connection.cursor() as cursor:
            # Query for user's energy points from the database
            cursor.execute('SELECT points FROM points_wallet WHERE user_id=%s', [request.user.id])
            points = cursor.fetchone()[0]

            # Query for user's real-time consumption on dashboard
            # cursor.execute("SELECT ROUND(SUM(power)::numeric, 1) FROM power_energy_consumption WHERE date >= now() - interval '1 minute' AND date < now() AND user_id=%s", [request.user.id])
            cursor.execute("SELECT ROUND(SUM(power)::numeric, 1) FROM power_energy_consumption WHERE date = '2020-08-04' AND time >= '13:58:00' AND time < '13:59:00' AND user_id=%s", [request.user.id])
            realtime_consumption = cursor.fetchone()[0]

            # Query for user's cumulative savings from the database
            cursor.execute("SELECT cum_savings FROM achievements_bonus WHERE user_id=%s", [request.user.id])
            cumulative_savings_kwh = cursor.fetchone()[0]
            cumulative_savings_dollars = '{:,.2f}'.format(cumulative_savings_kwh * 0.201)
            cumulative_savings_trees = round(cumulative_savings_kwh * 0.201 * 0.5)

            # Query for user's remaining points to be claimed for the week
            cursor.execute("SELECT SUM(lower_energy_con + turn_off_leave + turn_off_end + complete_all_daily) FROM achievements_daily WHERE user_id=%s", [request.user.id])
            daily_achievements = cursor.fetchone()[0]
            cursor.execute("SELECT SUM(cost_saving + schedule_based + complete_daily + complete_weekly) FROM achievements_weekly WHERE user_id=%s", [request.user.id])
            weekly_achievements = cursor.fetchone()[0]

        BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        points_table = pd.read_csv(os.path.join(BASE_DIR, 'plug_mate_app/dash_apps/finished_apps/tables_csv/achievements_points.csv'))
        max_weekly_points = sum(points_table[points_table['type'] == 'daily']['points']) * 5 + sum(points_table[points_table['type'] == 'weekly']['points'])
        remaining_points = max_weekly_points - daily_achievements - weekly_achievements
        os.environ['TZ'] = 'Asia/Singapore'

        context = {
            'points': points,
            'realtime_consumption': realtime_consumption,
            'current_time': strftime('%H:%M:%S', localtime()),
            'cumulative_savings_kwh': cumulative_savings_kwh,
            'cumulative_savings_dollars': cumulative_savings_dollars,
            'cumulative_savings_trees': cumulative_savings_trees,
            'remaining_points': remaining_points,
        }

        return render(request, 'plug_mate_app/index.html', context)
    else:
        return render(request, 'plug_mate_app/login.html', {})


def control_interface(request):
    return render(request, 'index.html')


def rewards(request):
    with connection.cursor() as cursor:
        # Query for user's energy points from the database
        cursor.execute('SELECT points FROM points_wallet WHERE user_id=%s', [request.user.id])
        points = cursor.fetchone()[0]

    context = {
        'points': points,
    }
    return render(request, 'plug_mate_app/rewards.html', context)


def user_profile(request):
    return render(request, 'plug_mate_app/user_profile.html')


@login_required
def special(request):
    # Remember to also set login url in settings.py!
    # LOGIN_URL = '/basic_app/user_login/'
    return HttpResponse("You are logged in. Nice!")

@login_required
def user_logout(request):
    # Log out the user.
    logout(request)
    # Return to homepage.
    return HttpResponseRedirect(reverse('index'))


def user_login(request):

    if request.method == 'POST':
        # First get the username and password supplied
        username = request.POST.get('username')
        password = request.POST.get('password')

        # Django's built-in authentication function:
        user = authenticate(username=username, password=password)

        # If we have a user
        if user:
            #Check it the account is active
            if user.is_active:
                # Log the user in.
                login(request, user)
                # Send the user back to some page.
                # In this case their homepage.
                return HttpResponseRedirect(reverse('plug_mate_app:index'))
            else:
                # If account is not active:
                return HttpResponse("Your account is not active.")

        else:
            print("Someone tried to login and failed.")
            print("They used username: {} and password: {}".format(username, password))
            return HttpResponse("Invalid login details supplied.")

    else:
        #Nothing has been provided for username or password.
        return render(request, 'plug_mate_app/login.html', {})


from .models import PresenceData, RemoteData, ScheduleData, AchievementsBonus, AchievementsWeekly
from .serializers import PresenceSerializer, RemoteSerializer, ScheduleSerializer, AchievementsBonusSerializer, AchievementsWeeklySerializer
from rest_framework import generics


# Create your views here.
class PresenceDataList(generics.ListCreateAPIView):
    authentication_classes = [authentication.SessionAuthentication]
    serializer_class = PresenceSerializer

    def get_queryset(self):
        """ This view should return a list of all the presence
        settings for the current authenticated user."""
        user = self.request.user.id
        return PresenceData.objects.filter(user_id = user)

class PresenceDataDetail(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [authentication.TokenAuthentication]
    queryset = PresenceData.objects.all()
    serializer_class = PresenceSerializer

class RemoteDataList(generics.ListCreateAPIView):
    authentication_classes = [authentication.SessionAuthentication]
    serializer_class = RemoteSerializer

    def get_queryset(self):
        """ This view should return a list of all the remote
        settings for the current authenticated user. """
        user = self.request.user.id
        return RemoteData.objects.filter(user_id = user)


class RemoteDataDetail(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [authentication.TokenAuthentication]
    queryset = RemoteData.objects.all()
    serializer_class = RemoteSerializer


class ScheduleDataList(generics.ListCreateAPIView):
    authentication_classes = [authentication.SessionAuthentication]
    serializer_class = ScheduleSerializer

    def get_queryset(self):
        """ This view should return a list of all the schedule
        settings for the current authenticated user. """
        user = self.request.user.id
        return ScheduleData.objects.filter(user_id = user)


class ScheduleDataDetail(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [authentication.TokenAuthentication]
    queryset = ScheduleData.objects.all()
    serializer_class = ScheduleSerializer

class AchievementsBonusDataList(generics.ListCreateAPIView):
    authentication_classes = [authentication.SessionAuthentication]
    serializer_class = AchievementsBonusSerializer

    def get_queryset(self):
        """ This view should return a list of all the bonus
        achievements for the current authenticated user."""
        user = self.request.user.id
        return AchievementsBonus.objects.filter(user_id = user)

class AchievementsBonusDataDetail(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [authentication.TokenAuthentication]
    queryset = AchievementsBonus.objects.all()
    serializer_class = AchievementsBonusSerializer

class AchievementsWeeklyDataList(generics.ListCreateAPIView):
    authentication_classes = [authentication.SessionAuthentication]
    serializer_class = AchievementsWeeklySerializer

    def get_queryset(self):
        """ This view should return a list of all the weekly
        achievements for the current authenticated user. """
        user = self.request.user.id
        return AchievementsWeekly.objects.filter(user_id = user)

class AchievementsWeeklyDataDetail(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [authentication.TokenAuthentication]
    queryset = AchievementsWeekly.objects.all()
    serializer_class = AchievementsWeeklySerializer
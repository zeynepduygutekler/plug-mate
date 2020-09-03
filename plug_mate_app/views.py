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
from .models import UserProfileInfo
from django.db import connection
from time import localtime, strftime
import os
import pandas as pd
import numpy as np
from datetime import datetime
import json


def plug_mate_app(request):
    if request.user.is_authenticated and request.user.id == 6:
        manager_page(request)
        context = {
            'notifications': [],
            'unseen_notifications': 0,
            'user_id': request.user.id
        }

        return render(request, 'plug_mate_app/manager_page.html', context)

    elif request.user.is_authenticated:
        with connection.cursor() as cursor:
            # Query for user's energy points from the database
            cursor.execute('SELECT points FROM points_wallet WHERE user_id=%s', [request.user.id])
            points = cursor.fetchone()[0]

            # Query for user's real-time consumption on dashboard
            cursor.execute("SELECT ROUND(SUM(power)::numeric, 1) FROM power_energy_consumption "
                           "WHERE TO_TIMESTAMP(unix_time) >= CURRENT_TIMESTAMP - interval '1 minute' "
                           "AND TO_TIMESTAMP(unix_time) < CURRENT_TIMESTAMP "
                           "AND user_id=%s", [request.user.id])
            # cursor.execute("SELECT ROUND(SUM(power)::numeric, 1) FROM power_energy_consumption WHERE date = '2020-08-04' AND time >= '13:58:00' AND time < '13:59:00' AND user_id=%s", [request.user.id])
            realtime_consumption = cursor.fetchone()[0]
            if realtime_consumption is None:
                realtime_consumption = 0.0

            # Query for user's cumulative savings from the database
            cursor.execute("SELECT cum_savings FROM achievements_bonus WHERE user_id=%s", [request.user.id])
            cumulative_savings_kwh = round(cursor.fetchone()[0] / (1000 * 60), 1)
            cumulative_savings_dollars = '{:,.2f}'.format(cumulative_savings_kwh * 0.201)
            cumulative_savings_trees = round(cumulative_savings_kwh * 0.201 * 0.5)

            # Query for user's remaining points to be claimed for the week
            cursor.execute("SELECT SUM(lower_energy_con + turn_off_leave + turn_off_end + "
                           "daily_presence + daily_schedule + daily_remote + complete_all_daily) FROM achievements_daily WHERE user_id=%s",
                           [request.user.id])
            daily_achievements = cursor.fetchone()[0]
            cursor.execute(
                "SELECT SUM(cost_saving + schedule_based + complete_daily + complete_weekly) "
                "FROM achievements_weekly WHERE user_id=%s",
                [request.user.id])
            weekly_achievements = cursor.fetchone()[0]

            # Query for the user's notifications
            cursor.execute("SELECT notifications FROM notifications WHERE user_id=%s", [request.user.id])
            notifications = json.loads(cursor.fetchone()[0])['notifications']
            notifications.reverse()
            if len(notifications) == 0:
                unseen_notifications = 0
            else:
                unseen_notifications = int(np.sum([1 for notification in notifications if notification['seen'] == 0]))

        BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        points_table = pd.read_csv(
            os.path.join(BASE_DIR, 'plug_mate_app/dash_apps/finished_apps/tables_csv/achievements_points.csv'))
        max_weekly_points = sum(points_table[points_table['type'] == 'daily']['points']) * 5 + sum(
            points_table[points_table['type'] == 'weekly']['points'])
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
            'user_id': request.user.id,
            'notifications': notifications,
            'unseen_notifications': unseen_notifications,
        }

        return render(request, 'plug_mate_app/index.html', context)

    else:
        return render(request, 'plug_mate_app/login.html', {})


def manager_page(request):
    # with connection.cursor() as cursor:
    #     # Query for the user's notifications
    #     cursor.execute("SELECT notifications FROM notifications WHERE user_id=%s", [request.user.id])
    #     notifications = json.loads(cursor.fetchone()[0])['notifications']
    #     if len(notifications) == 0:
    #         unseen_notifications = 0
    #     else:
    #         unseen_notifications = int(np.sum([1 for notification in notifications if notification['seen'] == 0]))

    context = {
        'notifications': [],
        'unseen_notifications': 0,
        'user_id': request.user.id
    }

    return render(request, 'plug_mate_app/manager_page.html', context)


def control_interface(request):
    if request.user.is_authenticated:
        with connection.cursor() as cursor:
            # Query for the user's notifications
            cursor.execute("SELECT notifications FROM notifications WHERE user_id=%s", [request.user.id])
            notifications = json.loads(cursor.fetchone()[0])['notifications']
            notifications.reverse()
            if len(notifications) == 0:
                unseen_notifications = 0
            else:
                unseen_notifications = int(np.sum([1 for notification in notifications if notification['seen'] == 0]))

        context = {
            'user_id': request.user.id,
            'notifications': notifications,
            'unseen_notifications': unseen_notifications
        }

        return render(request, 'index.html', context)
    else:
        return render(request, 'plug_mate_app/login.html', {})


def rewards(request):
    if request.user.is_authenticated:
        with connection.cursor() as cursor:
            # Query for user's energy points from the database
            cursor.execute('SELECT points FROM points_wallet WHERE user_id=%s', [request.user.id])
            points = cursor.fetchone()[0]

            # Query for the user's notifications
            cursor.execute("SELECT notifications FROM notifications WHERE user_id=%s", [request.user.id])
            notifications = json.loads(cursor.fetchone()[0])['notifications']
            notifications.reverse()
            if len(notifications) == 0:
                unseen_notifications = 0
            else:
                unseen_notifications = int(np.sum([1 for notification in notifications if notification['seen'] == 0]))

        context = {
            'points': points,
            'notifications': notifications,
            'unseen_notifications': unseen_notifications,
            'user_id': request.user.id,
        }

        return render(request, 'plug_mate_app/rewards.html', context)
    else:
        return render(request, 'plug_mate_app/login.html', {})


def user_profile(request):
    if request.user.is_authenticated:
        with connection.cursor() as cursor:
            # Query for the user's notifications
            cursor.execute("SELECT notifications FROM notifications WHERE user_id=%s", [request.user.id])
            notifications = json.loads(cursor.fetchone()[0])['notifications']
            notifications.reverse()
            if len(notifications) == 0:
                unseen_notifications = 0
            else:
                unseen_notifications = int(np.sum([1 for notification in notifications if notification['seen'] == 0]))

            # Query for user's rewards from database
            cursor.execute("SELECT description FROM user_log WHERE user_id=%s AND "
                           "type='reward' ORDER BY unix_time DESC", [request.user.id])
            rewards = cursor.fetchall()
            rewards = pd.DataFrame(rewards, columns=[desc[0] for desc in cursor.description])['description'].tolist()

            # Query for user's achievement history from database
            cursor.execute("SELECT unix_time, description FROM user_log WHERE user_id=%s AND "
                           "type='achievement' ORDER BY unix_time DESC", [request.user.id])
            achievements = cursor.fetchall()
            achievements = pd.DataFrame(achievements, columns=[desc[0] for desc in cursor.description])
            achievements['date'] = achievements['unix_time'].apply(
                lambda x: datetime.utcfromtimestamp(int(x)).strftime('%d %b %Y'))
            achievements = achievements[['date', 'description']]
            achievements = [dict(date=x[0], achievement=x[1]) for x in achievements.values]

            # Query for user's occupancy information from database
            cursor.execute("SELECT * FROM occupancy_profile WHERE user_id=%s ORDER BY id", [request.user.id])
            occupancy_info = cursor.fetchall()
            occupancy_info = pd.DataFrame(occupancy_info, columns=[desc[0] for desc in cursor.description])
            occupancy_info = occupancy_info['occupancy_prob'][6:].to_list()

            # Query for user profile information
            cursor.execute("SELECT * FROM plug_mate_app_userprofileinfo WHERE user_id=%s", [request.user.id])
            result = cursor.fetchone()
            user_profile = {'contact': result[2],
                            'email': result[3],
                            'room': result[4],
                            'occupation': result[5],
                            'gender': result[6],
                            'birthday': result[7].strftime("%d %B"),
                            'profile': result[8]}
            # Map profile description and img to profile type
            if user_profile['profile'] == 'Hustler':
                user_profile[
                    'profile_desc'] = """Hustlers are always quick to produce work, churning out projects after projects. ‘Office hours’ are a foreign concept to them and they are often hurrying from one meeting to another. They are the worker bees of the company, driving progress and making effective change."""
                user_profile['profile_img'] = 'https://image.flaticon.com/icons/svg/3286/3286414.svg'
            elif user_profile['profile'] == 'Office Guardian':
                user_profile[
                    'profile_desc'] = """Office guardians are the consistent worker bees in the office. You will always see them punctual to the office and their schedules are usually fixed a month in advance. They are the ones whom you can depend on if you need help."""
                user_profile['profile_img'] = 'https://image.flaticon.com/icons/svg/3315/3315549.svg'
            elif user_profile['profile'] == 'Vagabond':
                user_profile[
                    'profile_desc'] = """Vagabonds are like roamers of the office. They don’t like to be confined in one spot, but embrace the variability of their work space. They are always flexible in their whereabouts, adapting quickly. """
                user_profile['profile_img'] = 'https://image.flaticon.com/icons/svg/2127/2127682.svg'
            else:
                user_profile['profile_desc'] = """We're still getting to know you"""
                user_profile['profile_img'] = 'https://image.flaticon.com/icons/svg/2807/2807684.svg'

        context = {
            'user_id': request.user.id,
            'notifications': notifications,
            'unseen_notifications': unseen_notifications,
            'rewards': rewards,
            'user_profile': user_profile,
            'occupancy_info': occupancy_info,
            'achievements': achievements,
        }

        return render(request, 'plug_mate_app/user_profile.html', context)
    else:
        return render(request, 'plug_mate_app/login.html', {})


def about_us(request):
    if request.user.is_authenticated:
        with connection.cursor() as cursor:
            # Query for the user's notifications
            cursor.execute("SELECT notifications FROM notifications WHERE user_id=%s", [request.user.id])
            notifications = json.loads(cursor.fetchone()[0])['notifications']
            notifications.reverse()
            if len(notifications) == 0:
                unseen_notifications = 0
            else:
                unseen_notifications = int(np.sum([1 for notification in notifications if notification['seen'] == 0]))

        context = {
            'user_id': request.user.id,
            'notifications': notifications,
            'unseen_notifications': unseen_notifications
        }

        return render(request, 'plug_mate_app/about_us.html', context)
    else:
        context = {
            'user_id': request.user.id,
            'notifications': [],
            'unseen_notifications': 0
        }
        return render(request, 'plug_mate_app/about_us.html', context)


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
            # Check it the account is active
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
        # Nothing has been provided for username or password.
        return render(request, 'plug_mate_app/login.html', {})


from .models import PointsWallet, PresenceData, RemoteData, ScheduleData, \
    AchievementsBonus, AchievementsWeekly, AchievementsDaily, \
    Notifications, UserLog, Presence
from .serializers import PointsWalletSerializer, PresenceSerializer, RemoteSerializer, ScheduleSerializer, \
    AchievementsBonusSerializer, AchievementsWeeklySerializer, AchievementsDailySerializer, \
    NotificationsSerializer, UserLogSerializer, UserPresenceSerializer
from rest_framework import generics


# Create your views here.
class PresenceDataList(generics.ListCreateAPIView):
    authentication_classes = [authentication.SessionAuthentication]
    serializer_class = PresenceSerializer

    def get_queryset(self):
        """ This view should return a list of all the presence
        settings for the current authenticated user."""
        user = self.request.user.id
        return PresenceData.objects.filter(user_id=user)


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
        return RemoteData.objects.filter(user_id=user)


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
        return ScheduleData.objects.filter(user_id=user)


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
        return AchievementsBonus.objects.filter(user_id=user)


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
        return AchievementsWeekly.objects.filter(user_id=user)


class AchievementsWeeklyDataDetail(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [authentication.TokenAuthentication]
    queryset = AchievementsWeekly.objects.all()
    serializer_class = AchievementsWeeklySerializer


class AchievementsDailyDataList(generics.ListCreateAPIView):
    authentication_classes = [authentication.SessionAuthentication]
    serializer_class = AchievementsDailySerializer

    def get_queryset(self):
        """ This view should return a list of all the weekly
        achievements for the current authenticated user. """
        user = self.request.user.id
        return AchievementsDaily.objects.filter(user_id=user)


class AchievementsDailyDataDetail(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [authentication.TokenAuthentication]
    queryset = AchievementsDaily.objects.all()
    serializer_class = AchievementsDailySerializer


class PointsWalletDataList(generics.ListCreateAPIView):
    authentication_classes = [authentication.SessionAuthentication]
    serializer_class = PointsWalletSerializer

    def get_queryset(self):
        """ This view should return the points in the energy wallet
        of the current authenticated user. """
        user = self.request.user.id
        return PointsWallet.objects.filter(user_id=user)


class PointsWalletDataDetail(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [authentication.TokenAuthentication]
    queryset = PointsWallet.objects.all()
    serializer_class = PointsWalletSerializer


class NotificationsDataList(generics.ListCreateAPIView):
    authentication_classes = [authentication.SessionAuthentication]
    serializer_class = NotificationsSerializer

    def get_queryset(self):
        """ This view should return the notifications for the
        current authenticated user. """
        user = self.request.user.id
        return Notifications.objects.filter(user_id=user)


class NotificationsDataDetail(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [authentication.TokenAuthentication]
    queryset = Notifications.objects.all()
    serializer_class = NotificationsSerializer


class UserLogDataList(generics.ListCreateAPIView):
    authentication_classes = [authentication.SessionAuthentication]
    serializer_class = UserLogSerializer

    def get_queryset(self):
        """ This view should return the user log for the
        current authenticated user. """
        user = self.request.user.id
        return UserLog.objects.filter(user_id=user)[:1]


class UserLogDataDetail(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [authentication.TokenAuthentication]
    queryset = UserLog.objects.all()
    serializer_class = UserLogSerializer


class UserPresenceDataList(generics.ListCreateAPIView):
    authentication_classes = [authentication.SessionAuthentication]
    serializer_class = UserPresenceSerializer

    def get_queryset(self):
        """ This view should return the latest presence of
        the current authenticated user. """
        user = self.request.user.id
        return Presence.objects.filter(user_id=user).order_by('-id')[:1]

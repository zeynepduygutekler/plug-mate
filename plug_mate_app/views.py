from django.shortcuts import render
from plotly.offline import plot
import plotly.graph_objects as go
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponseRedirect, HttpResponse
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from . import serializers
from .models import Users, PowerEnergyConsumption, PointsWallet, Meters
from django.db import connection
from time import localtime, strftime
import os

# class UserViewSet(viewsets.ModelViewSet):
#     queryset = Users.objects.all().order_by('user_id')
#     serializer_class = UserSerializer


# class HelloApiView(APIView):
#     serializer_class = serializers.HelloSerializer
#
#     def get(self, request, format=None):
#         an_apiview = [
#             'uses HTTP methods as function (get, post, patch, put, delete)',
#             'is similar to traditional django view',
#             'gives you most control over app logic',
#             'is mapped manually to urls',
#         ]
#
#         return Response({'message': 'Hello!', 'an_apiview': an_apiview})
#
#     def post(self, request):
#         serializer = self.serializer_class(data=request.data)
#         if serializer.is_valid():
#             name = serializer.validated_data.get('name')
#             message = f'Hello {name}'
#             return Response({'message': message})
#         else:
#             return Response(serializer.errors,
#                             status=status.HTTP_400_BAD_REQUEST)
#
#     def put(self, request, pk=None):
#         return Response({'method': 'PUT'})
#
#     def patch(self, request, pk=None):
#         return Response({'method': 'PATCH'})
#
#     def delete(self, request, pk=None):
#         return Response({'method': 'DELETE'})


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

        os.environ['TZ'] = 'Asia/Singapore'

        context = {
            'points': points,
            'realtime_consumption': realtime_consumption,
            'current_time': strftime('%H:%M:%S', localtime())
        }

        return render(request, 'plug_mate_app/index.html', context)
    else:
        return render(request, 'plug_mate_app/login.html', {})


def control_interface(request):
    return render(request, 'index.html')


def rewards(request):
    return render(request, 'plug_mate_app/rewards.html')


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


from .models import PresenceData, RemoteData, ScheduleData, AchievementsBonus
from .serializers import PresenceSerializer, RemoteSerializer, ScheduleSerializer, AchievementsBonusSerializer
from rest_framework import generics


# Create your views here.
class PresenceDataList(generics.ListCreateAPIView):
    queryset = PresenceData.objects.all()
    serializer_class = PresenceSerializer


class PresenceDataDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = PresenceData.objects.all()
    serializer_class = PresenceSerializer


class RemoteDataList(generics.ListCreateAPIView):
    queryset = RemoteData.objects.all()
    serializer_class = RemoteSerializer


class RemoteDataDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = RemoteData.objects.all()
    serializer_class = RemoteSerializer


class ScheduleDataList(generics.ListCreateAPIView):
    queryset = ScheduleData.objects.all()
    serializer_class = ScheduleSerializer


class ScheduleDataDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = ScheduleData.objects.all()
    serializer_class = ScheduleSerializer

class AchievementsBonusDataList(generics.ListCreateAPIView):
    queryset = AchievementsBonus.objects.all()
    serializer_class = AchievementsBonusSerializer

class AchievementsBonusDataDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = AchievementsBonus.objects.all()
    serializer_class = AchievementsBonusSerializer
from django.shortcuts import render
# from .forms import UserForm, UserProfileInfoForm
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
# from .serializers import UserSerializer
from .models import Users, PowerEnergyConsumption, PointsWallet, Meters
from django.db import connection

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


def plug_mate_app(requests):
    if requests.user.id is None:
        points = 0
    else:
        with connection.cursor() as cursor:
            cursor.execute('SELECT points FROM points_wallet WHERE user_id=%s', [requests.user.id])
            points = cursor.fetchone()[0]
    context = {
        'points': points,
    }
    return render(requests, 'plug_mate_app/index.html', context)


def control_interface(requests):
    return render(requests, 'index.html')


def rewards(requests):
    return render(requests, 'plug_mate_app/rewards.html')


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


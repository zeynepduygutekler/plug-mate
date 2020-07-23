from django.urls import path
from . import views
from plug_mate_app.dash_apps.finished_apps import cost_savings
from plug_mate_app.dash_apps.finished_apps import progress
from plug_mate_app.dash_apps.finished_apps import historical_consumption
from plug_mate_app.dash_apps.finished_apps import tips


app_name='plug_mate_app'

urlpatterns = [
    path('', views.plug_mate_app, name='index'),
    path('user_login/', views.user_login, name='user_login')
]

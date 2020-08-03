from django.urls import path, include
from rest_framework import routers
from . import views
from plug_mate_app.dash_apps.finished_apps import cost_savings
from plug_mate_app.dash_apps.finished_apps import progress
from plug_mate_app.dash_apps.finished_apps import historical_consumption
from plug_mate_app.dash_apps.finished_apps import tips
from plug_mate_app.dash_apps.finished_apps import trees_saved


# router = routers.DefaultRouter()
# router.register(r'users', views.UserViewSet)

app_name = 'plug_mate_app'

# Wire up our API using automatic URL routing.
# Additional, we include login URLs for the browsable API.
urlpatterns = [
    # path('api/', include(router.urls)),
    # path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('hello-view/', views.HelloApiView.as_view()),
    path('', views.plug_mate_app, name='index'),
    path('user_login/', views.user_login, name='user_login'),
    path('control_interface/', views.control_interface, name='control_interface'),
    path('rewards/', views.rewards, name='rewards')
]

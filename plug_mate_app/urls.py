from django.urls import path, include
from rest_framework import routers
# from .api import RemoteViewSet, ScheduleViewSet, PresenceViewSet
from rest_framework.urlpatterns import format_suffix_patterns
from . import views
from plug_mate_app.dash_apps.finished_apps import cost_savings
from plug_mate_app.dash_apps.finished_apps import progress
from plug_mate_app.dash_apps.finished_apps import historical_consumption
from plug_mate_app.dash_apps.finished_apps import tips


router = routers.DefaultRouter()
# router.register('remote', RemoteViewSet, 'remote')
# router.register('schedule', ScheduleViewSet, 'schedule')
# router.register('presence', PresenceViewSet, 'presence')

app_name = 'plug_mate_app'

# Wire up our API using automatic URL routing.
# Additional, we include login URLs for the browsable API.
urlpatterns = [
    # path('api/', include(router.urls)),
    path('control_interface/api/presence/', views.PresenceDataList.as_view()),
    path('control_interface/api/presence/<int:pk>/', views.PresenceDataDetail.as_view()),
    path('control_interface/api/remote/', views.RemoteDataList.as_view()),
    path('control_interface/api/remote/<int:pk>/', views.RemoteDataDetail.as_view()),
    path('control_interface/api/schedule/', views.ScheduleDataList.as_view()),
    path('control_interface/api/schedule/<int:pk>/', views.ScheduleDataDetail.as_view()),
    path('control_interface/api/achievements_bonus/', views.AchievementsBonusDataList.as_view()),
    path('control_interface/api/achievements_bonus/<int:pk>/', views.AchievementsBonusDataDetail.as_view()),
    path('control_interface/api/achievements_weekly/', views.AchievementsWeeklyDataList.as_view()),
    path('control_interface/api/achievements_weekly/<int:pk>/', views.AchievementsWeeklyDataDetail.as_view()),
    path('control_interface/api/achievements_daily/', views.AchievementsDailyDataList.as_view()),
    path('control_interface/api/achievements_daily/<int:pk>/', views.AchievementsDailyDataDetail.as_view()),
    path('control_interface/api/points_wallet/', views.PointsWalletDataList.as_view()),
    path('control_interface/api/points_wallet/<int:pk>/', views.PointsWalletDataDetail.as_view()),
    path('control_interface/api/notifications/', views.NotificationsDataList.as_view()),
    path('control_interface/api/notifications/<int:pk>/', views.NotificationsDataDetail.as_view()),
    path('control_interface/api/user_log/', views.UserLogDataList.as_view()),
    path('control_interface/api/user_log/<int:pk>/', views.UserLogDataDetail.as_view()),
    path('control_interface/api/user_presence/', views.UserPresenceDataList.as_view()),
    path('', views.plug_mate_app, name='index'),
    path('manager_page/', views.manager_page, name='manager_page'),
    path('profile/', views.user_profile, name='profile'),
    path('user_login/', views.user_login, name='user_login'),
    path('control_interface/', views.control_interface, name='control_interface'),
    path('rewards/', views.rewards, name='rewards'),
    path('about_us', views.about_us, name='about_us')
]

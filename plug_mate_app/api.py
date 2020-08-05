from .models import RemoteControl, ScheduleBasedControl, PresenceBasedControl
from rest_framework import viewsets, permissions
from .serializers import RemoteSerializer, PresenceSerializer, ScheduleSerializer


# Remote Viewset
class RemoteViewSet(viewsets.ModelViewSet):
    queryset = RemoteControl.objects.all()
    permissions_classes = [permissions.AllowAny]
    serializer_class = RemoteSerializer


# Schedule Viewset
class ScheduleViewSet(viewsets.ModelViewSet):
    queryset = ScheduleBasedControl.objects.all()
    permissions_classes = [permissions.AllowAny]
    serializer_class = ScheduleSerializer


# Presence Viewset
class PresenceViewSet(viewsets.ModelViewSet):
    queryset = PresenceBasedControl.objects.all()
    permissions_classes = [permissions.AllowAny]
    serializer_class = PresenceSerializer

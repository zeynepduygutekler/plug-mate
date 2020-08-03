from rest_framework import serializers
from .models import Users


class HelloSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=10)


    # class Meta:
    #     model = Users
    #     fields = ('user_id', 'user_name', 'mac_address')

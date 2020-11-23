from tiger.models import User
from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'email', 'id', 'okta_id', 'is_subscriber', 'first_name', 'last_name', 'is_superuser',
                  'is_staff', 'is_active', 'watchlist')

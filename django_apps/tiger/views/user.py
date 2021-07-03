from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_tracking.mixins import LoggingMixin
from tiger.models import User
from tiger.serializers import UserSerializer

from .utils import handle_referral


class UserViewSet(LoggingMixin, viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        queryset = self.queryset.filter(pk=self.request.user.id)

        return queryset

    @action(methods=['get'], detail=False)
    def me(self, request, *args, **kwargs):
        serializer = UserSerializer(request.user)

        handle_referral(request)

        return Response(serializer.data)

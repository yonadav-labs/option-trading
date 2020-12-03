from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.http.response import JsonResponse
from rest_framework.parsers import JSONParser
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
import requests
import os

from tiger.serializers import UserSerializer
from tiger.models import User


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_detail(request):
    if request.method == 'GET':
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
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
def user_detail(request, id):
    if request.method == 'GET':
        user = get_object_or_404(User, okta_id=id)
        serializer = UserSerializer(user)
        return Response(serializer.data)
    # elif request.method == 'PUT':
    #     user_data = JSONParser().parse(request)
    #     serializer = UserSerializer(user, data=user_data)
    #     if serializer.is_valid():
    #         serializer.save()
    #         return Response(serializer.data)
    #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    # elif request.method == 'DELETE':
    #     user.delete()
    #     return JsonResponse({'message': 'User was deleted successfully!'}, status=status.HTTP_204_NO_CONTENT)

    # if request.method == 'GET':
    #     user_obj = get_object_or_404(User, id=user_id)
    #     serializer = UserSerializer(user_obj)
    #     # user_obj = User.objects.get(pk=user_id)
    #     # user_obj = User.objects.filter(id=user_id)
    #     if user_obj is None:
    #         return Response(status=500)
    #     return Response({'user': serializer.data})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_list(request):
    if request.method == 'GET':
        users = User.objects.all()

        email = request.GET.get('email', None)
        if email is not None:
            users = users.filter(email_icontains=email)

        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
        # 'safe=False' for objects serialization
    # elif request.method == 'POST':
    #     user_data = JSONParser().parse(request)
    #     serializer = UserSerializer(data=user_data)
    #     if serializer.is_valid():
    #         serializer.save()
    #         return Response(serializer.data, status=status.HTTP_201_CREATED)
    #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    # elif request.method == 'DELETE':
    #     count = User.objects.all().delete()
    #     return Response({'message': '{} Users were deleted successfully!'.format(count[0])},
    #                         status=status.HTTP_204_NO_CONTENT)

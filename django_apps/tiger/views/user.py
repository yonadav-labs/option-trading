from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http.response import JsonResponse
from rest_framework.parsers import JSONParser
from rest_framework import status
import requests
import os

from tiger.serializers import UserSerializer
from tiger.models import User


@api_view(['GET', 'PUT', 'DELETE'])
def user_detail(request, id):
    try:
        user = User.objects.get(okta_id=id)
    except User.DoesNotExist:
        headers = {'Authorization': f"SSWS{os.environ['OKTA_API_KEY']}"}
        response = requests.get(f"https://dev-7756696.okta.com/api/v1/users/{id}", headers=headers)
        if response.ok:
            data = response.json()
            user = User(
                okta_id=data["id"],
                username=data["profile"]["login"],
                is_superuser=False,
                first_name=data["profile"]["firstName"],
                last_name=data["profile"]["lastName"],
                email=data["profile"]["email"],
                is_staff=False,
                is_active=True,
                is_subscriber=False,
                watchlist=[]
            )
            user.save()
            # return Response(response.json(), status=response.status_code)
        else:
            return Response(response.json(), status=response.status_code)

    if request.method == 'GET':
        serializer = UserSerializer(user)
        return JsonResponse(serializer.data)
    elif request.method == 'PUT':
        user_data = JSONParser().parse(request)
        serializer = UserSerializer(user, data=user_data)
        print(user_data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data)
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        user.delete()
        return JsonResponse({'message': 'User was deleted successfully!'}, status=status.HTTP_204_NO_CONTENT)

    # if request.method == 'GET':
    #     user_obj = get_object_or_404(User, id=user_id)
    #     serializer = UserSerializer(user_obj)
    #     # user_obj = User.objects.get(pk=user_id)
    #     # user_obj = User.objects.filter(id=user_id)
    #     if user_obj is None:
    #         return Response(status=500)
    #     return Response({'user': serializer.data})


@api_view(['GET', 'POST', 'DELETE'])
def user_list(request):
    if request.method == 'GET':
        users = User.objects.all()

        username = request.GET.get('username', None)
        if username is not None:
            users = users.filter(username_icontains=username)

        serializer = UserSerializer(users, many=True)
        return JsonResponse(serializer.data, safe=False)
        # 'safe=False' for objects serialization
    elif request.method == 'POST':
        user_data = JSONParser().parse(request)
        serializer = UserSerializer(data=user_data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=status.HTTP_201_CREATED)
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        count = User.objects.all().delete()
        return JsonResponse({'message': '{} Users were deleted successfully!'.format(count[0])},
                            status=status.HTTP_204_NO_CONTENT)

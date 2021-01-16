from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from tiger.serializers import UserSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_detail(request):
    if request.method == 'GET':
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
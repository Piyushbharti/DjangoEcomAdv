from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .serializer import UserSerializer
from rest_framework.permissions import IsAuthenticated

@csrf_exempt
@api_view(['POST'])
# @permission_classes([IsAuthenticated])
def registerUser(request):
    serialize = UserSerializer(data=request.data)
    if serialize.is_valid():
        serialize.save()
        return Response({"status": 201, "data": serialize.data})
    return Response({"status": 400, "errors": serialize.errors})


@csrf_exempt
@api_view(['POST'])
def loginUser(request):
    getUser = get_object_or_404(User, email=request.data['email'])
    if not getUser.check_password(request.data['password']):
        return Response({"status": 400, "errors": "invalid password"})
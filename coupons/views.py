from django.shortcuts import render
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import  IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response

# Create your views here.
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def applyCoupon(request):
    code = request.data.get('code')
    total_amount = request.data.get('total_amount')
    
    return Response({
        "msg" : "success"
    })
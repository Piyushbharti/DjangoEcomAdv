from django.shortcuts import render, get_object_or_404
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import  IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import StockNotification


# Create your views here.
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def stockNotifier(request):
    user = request.user
    product_id = request.data.get('product_id')
    notification, created = StockNotification.objects.get_or_create(user=user, product_id=product_id)
    return Response({
        "message": "Notification Enabled"
    })




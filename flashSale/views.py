from django.shortcuts import render
from django.shortcuts import render, get_object_or_404
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import  IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from .serializer import FlashSaleSerializer
from .models import FlashSale
# Create your views here.

@api_view(['GET'])
def getActiveSales(request):
    allProduct = FlashSale.objects.filter(status = True)
    if not allProduct.exists():
        return Response({
            "status": 404,
            "message": "No Data found"
        })
    serializer = FlashSaleSerializer(allProduct, many=True)
    return Response({
        "status" : 200,
        "data": serializer.data
    })
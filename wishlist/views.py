from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from store.models import Product
from rest_framework.response import Response
from .models import WhishList
from .serializer import WhishlistSerializer
from django.contrib.auth import authenticate
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import  IsAuthenticated

# Create your views here.

@csrf_exempt
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def addProductToWhishList(request, product_id):
    product = get_object_or_404(Product, id = product_id)
    item, created = WhishList.objects.get_or_create(user = request.user, product=product)
    if created:
        return Response({'status': 201, 'message': 'Success'})
    else:
        return Response({'status': 200, 'message': 'Success'})

@csrf_exempt
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def allWishListData(request):
    user = request.user
    data = WhishList.objects.filter(user = user)
    serialize = WhishlistSerializer(data, many=True)
    return Response({'data': serialize.data})

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def deleteWishListData(request, product_id):
    data = get_object_or_404(WhishList, user = request.user, product_id = product_id)
    data.delete()
    remaning = WhishList.objects.filter(user = request.user)
    serialize = WhishlistSerializer(remaning, many=True)
    return Response({'data': serialize.data})

@csrf_exempt
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def delAllWishListData(request):
    data = WhishList.objects.filter(user = request.user)
    data.delete()
    return Response({'data': [], 'message': 'All WishList Removed'})
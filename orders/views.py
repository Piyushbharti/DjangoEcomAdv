from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import  IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from store.models import Product, Variation
from .models import Cart, CartItem
from .serializer import VariationSerializer
from django.db import transaction


@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def temp(request):
    isAuthenticated = request.user.is_authenticated
    if isAuthenticated:
        try:
            shipping_address = request.data.get('shipping_address')
            payment_info = request.data.get('payment_info')
            cart = Cart.objects.get(user=request.user)
            with transaction.atomic():
                
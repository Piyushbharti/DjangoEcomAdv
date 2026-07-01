from django.shortcuts import render
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import  IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response
from .models import CouponUsage
from .serializer import CouponSerializer

# Create your views here.
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def applyCoupon(request):
    code = request.data.get('code')
    total_amount = request.data.get('total_amount')
    onetimecopoun = ['NEWORDER']
    couponUsageData = CouponUsage.objects.get(request.user)
    if couponUsageData.data.coupon.code in onetimecopoun:
        return Response({
            "msg": 'New User Only'
        })
    serializer = CouponUsageSerializer(data = couponUsageData)
    return Response({
        "msg" : "success",
        "data": serializer.data
    })

@api_view(['POST'])
def addCoupon(request):
    item = request.data
    serializer = CouponSerializer(data = item)
    if serializer.is_valid():
        serializer.save()
        return Response({
            "msg" : "Coupon Added Successfully",
            "data" : serializer.data
        })


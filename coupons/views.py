from django.shortcuts import render
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import  IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response
from .models import Coupon, CouponUsage
from .serializer import CouponSerializer, CouponUsageSerializer

# Create your views here.
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def applyCoupon(request):
    code = request.data.get('code')
    total_amount = request.data.get('total_amount')

    # Find the coupon by code
    try:
        coupon = Coupon.objects.get(code = code, is_active = True)
    except Coupon.DoesNotExist:
        return Response({
            "msg" : "Invalid Coupon or Coupon Does Not Exist",
            "code" : 400
        })

    # Check if first_order_only coupon is already used by this user
    if coupon.first_order_only == True:
        already_used = CouponUsage.objects.filter(coupon = coupon, user = request.user).exists()
        if already_used:
            return Response({"msg" : "Coupon only available for first time order", "code": 400})
    
    # Calculate discount
    if coupon.discount_type == 'percent':
        discount = (total_amount * coupon.discount_value) / 100
        if coupon.max_discount and discount > coupon.max_discount:
            discount = coupon.max_discount
    else:
        discount =  coupon.discount_value
    Final_amount = total_amount - discount
    # Record usage
    CouponUsage.objects.create(user = request.user, coupon = coupon)
    coupon.used_count +=1
    coupon.save()
    return Response({
        "msg" : "success",
        "discount": discount,
        "finalPrice" : Final_amount,
        "total_amount" : total_amount
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


@api_view(['GET'])
def listCoupons(request):
    from django.utils import timezone
    now = timezone.now()
    coupons = Coupon.objects.filter(is_active=1, valid_from__lte=now, valid_until__gte=now)
    serializer = CouponSerializer(coupons, many=True)
    return Response({
        "msg": "success",
        "data": serializer.data
    })

    


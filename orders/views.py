from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import  IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from store.models import Product
from carts.models import Cart, CartItem
from django.db import transaction
from .models import OrderItem, Order


@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def create_order(request):
    try:
        shipping_address = request.data.get('shipping_address')
        payment_info = request.data.get('payment_info')
        cart = Cart.objects.get(user=request.user)
        with transaction.atomic():
            cart_items = CartItem.objects.filter(cart=cart)
            total = 0
            order_item_data = []
            for item in cart_items:
                product = Product.objects.select_for_update().get(id = item.product.id)
                product.stock -= item.quantity
                product.save()

                subTotal = product.price * item.quantity
                total += subTotal
                order_item_data.append({
                    "product": product,
                    "product_name": product.product_name,
                    "quantity": item.quantity,
                    "product_price" : product.price,
                    "variations": item.variations or []
                })
            order = Order.objects.create(
                user = request.user,
                shipping_address = shipping_address,
                payment_info = payment_info,
                status = 'paid',
                total = total
            )

            for data in order_item_data:
                OrderItem.objects.create(order = order, **data)
            cart_items.delete()
    except Exception as e:
        return Response({
            "code": 400,
            'message': f"Bad Request {e}"
        })
    return Response({
        "code": 200,
        'message': "Success",
        'order_number': order.order_number,
    })


# ============================================================
#  GET /orders/my-orders/
# ============================================================
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_my_orders(request):
    orders = Order.objects.filter(user=request.user).order_by('-created_at')

    data = []
    for order in orders:
        items = OrderItem.objects.filter(order=order)
        data.append({
            "id": order.id,
            "order_number": order.order_number,
            "status": order.status,
            "total": order.total,
            "created_at": order.created_at,
            "shipping_address": order.shipping_address,
            "items": [
                {
                    "product_name": item.product_name,
                    "product_price": item.product_price,
                    "quantity": item.quantity,
                    "variations": item.variations,
                }
                for item in items
                    
            ]
        })

    return Response({"orders": data})

from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from store.models import Product
from .models import Cart, CartItem
from django.shortcuts import get_object_or_404

@api_view(['GET'])
def temp(request):
    return Response({"status": 200, "message": "api running fine"}, status=status.HTTP_404_NOT_FOUND)


def _cart_id(request):
    cart = request.session.session_key
    if not cart:
        cart = request.session.create()
    return cart

@api_view(['POST'])
def add_cart(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    try:
        cart = Cart.objects.get(cart_id=_cart_id(request))
    except Cart.DoesNotExist:
        cart = Cart.objects.create(
            cart_id = _cart_id(request)
        )
    cart.save()
    
    try:
        cart_item = CartItem.objects.get(product = product, cart=cart)
        cart_item.quantity+=1
        cart_item.save()
    except CartItem.DoesNotExist:
        cart_item = CartItem.objects.create(
            product = product,
            quantity = 1,
            cart = cart,
        )
    return Response({
        
        "status": 200,
        "message": "Product added to cart",
        "product": product.product_name,
        "quantity": cart_item.quantity
    }, status=status.HTTP_200_OK)
        
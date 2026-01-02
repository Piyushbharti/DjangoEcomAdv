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
        
        
@api_view(['GET'])
def cart(request):
    total = 0
    quantity = 0
    cart_items = []
    try:
        cart = Cart.objects.get(cart_id = _cart_id(request))
        items = CartItem.objects.filter(cart=cart, is_active = True)
        for item in items:
            total += item.product.price * item.quantity
            quantity += item.quantity
            cart_items.append({
                "product_id": item.product.id,
                "product_name": item.product.product_name,
                "price": item.product.price,
                "quantity": item.quantity,
                "subtotal": item.product.price * item.quantity
            })

    except Cart.DoesNotExist:
        pass
    return Response({
        "status": 200,
        "total": total,
        "quantity": quantity,
        "cart_items": cart_items
    }, status=status.HTTP_200_OK)
    

@api_view(['GET'])
def remove_cart(request, product_id):
    total = 0
    quantity = 0
    cart_items = []
    cart = Cart.objects.get(cart_id = _cart_id(request))
    product = get_object_or_404(Product, id = product_id)
    cart_Item = CartItem.objects.filter(product=product, cart=cart)
    print(product, cart_Item.quantity, "checkkro")
    if cart_Item.quantity>1:
        cart_Item.quantity-=1
        cart_Item.save()
    else:
        cart_Item.delete()
    for item in cart_Item:
            total += item.product.price * item.quantity
            quantity += item.quantity
            cart_items.append({
                "product_id": item.product.id,
                "product_name": item.product.product_name,
                "price": item.product.price,
                "quantity": item.quantity,
                "subtotal": item.product.price * item.quantity
            })
    return Response({
        "status": 200,
        "total": total,
        "quantity": quantity,
        "cart_items": cart_items
    }, status=status.HTTP_200_OK)    
    
from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from store.models import Product, Variation
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

    # ---------- Get Product ----------
    product = get_object_or_404(Product, id=product_id)


    # ---------- Get or Create Cart ----------
    cart, created = Cart.objects.get_or_create(
        cart_id=_cart_id(request)
    )


    # ---------- Get variations_id from request ----------
    variation_ids = request.data.get('variations_id', [])

    # Safety: ensure list of int
    if isinstance(variation_ids, str):
        import json
        try:
            variation_ids = json.loads(variation_ids)
        except:
            variation_ids = variation_ids.split(',')

    variation_ids = list(map(int, variation_ids))


    # ---------- Fetch Variations ----------
    variations = Variation.objects.filter(
        id__in=variation_ids,
        product=product,
        is_active=True
    )
    

    # ---------- Check Existing CartItem ----------
    cart_items = CartItem.objects.filter(
        product=product,
        cart=cart
    )

    found = False

    for item in cart_items:

        existing_vars = set(item.variations.all())
        new_vars = set(variations)

        # Same product + same variations
        if existing_vars == new_vars:
            item.quantity += 1
            item.save()
            cart_item = item
            found = True
            break


    # ---------- Create New CartItem ----------
    if not found:

        cart_item = CartItem.objects.create(
            product=product,
            cart=cart,
            quantity=1
        )

        cart_item.variations.set(variations)
        temp = CartItem.objects.all()
        print(temp)

    # ---------- Response ----------
    return Response({
        "status": 200,
        "message": "Product added to cart",
        "product": product.product_name,
        "quantity": cart_item.quantity,
        "variations": [
            {
                "id": v.id,
                "category": v.variation_category,
                "value": v.variation_value
            } for v in cart_item.variations.all()
        ]
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

    cart = Cart.objects.get(cart_id=_cart_id(request))
    product = get_object_or_404(Product, id=product_id)

    cart_item = get_object_or_404(CartItem, product=product, cart=cart)

    if cart_item.quantity > 1:
        cart_item.quantity -= 1
        cart_item.save()
    else:
        cart_item.delete()

    cart_items_qs = CartItem.objects.filter(cart=cart)

    for item in cart_items_qs:
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
    
@api_view(['GET'])
def delete_cart(request, product_id):
    total = 0
    quantity = 0
    cart_items = []

    cart = Cart.objects.get(cart_id=_cart_id(request))
    product = get_object_or_404(Product, id=product_id)

    CartItem.objects.filter(cart=cart, product=product).delete()
    

    cart_items_qs = CartItem.objects.filter(cart=cart)

    for item in cart_items_qs:
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
   
    
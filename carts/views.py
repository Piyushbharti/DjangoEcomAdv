from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from store.models import Product, Variation
from .models import Cart, CartItem
from django.shortcuts import get_object_or_404
from .serializer import VariationSerializer

@api_view(['GET'])
def temp(request):
    return Response({"status": 200, "message": "api running fine"}, status=status.HTTP_404_NOT_FOUND)


def _cart_id(request):
    cart = request.session.session_key
    if not cart:
        cart = request.session.create()
    return cart
def prepare_variations_data(variations_qs):

    return [
        {
            "id": v.id,
            "category": v.variation_category,
            "value": v.variation_value,
            "qty": 1
        }
        for v in variations_qs
    ]

@api_view(['GET'])
def getAllVariation(request):
    variation = Variation.objects.all()
    res = VariationSerializer(variation, many=True)
    return Response({
        "data" : res.data
    })

@api_view(['POST'])
def add_cart(request, product_id):
    print(request, "request")
    product = get_object_or_404(Product, id=product_id)
    
    cart, _ = Cart.objects.get_or_create(
        cart_id=_cart_id(request)
    )


    # ---------- Get variation ids ----------
    variation_ids = request.data.get('variations_id', [])
    print(variation_ids, "variation_ids")
    if isinstance(variation_ids, str):
        import json
        try:
            variation_ids = json.loads(variation_ids)
        except:
            variation_ids = variation_ids.split(',')

    variation_ids = list(map(int, variation_ids))

    # ---------- Fetch variations ----------
    variations = Variation.objects.filter(
        id__in=variation_ids,
        is_active=True,
        product = product_id
    )
    if not variations:
        return Response({
            "status" : 404,
            "msg": "Product this this variation not found"
        }, status=status.HTTP_200_OK)


    # ---------- Get/Create CartItem ----------
    cart_item, _ = CartItem.objects.get_or_create(
        product=product,
        cart=cart,
        defaults={
            "quantity": 0,
            "variations": []
        }
    )


    variations_data = cart_item.variations or []


    # ---------- Convert to Dict (Fast Lookup) ----------
    variation_map = {
        int(v["id"]): v for v in variations_data
    }


    # ---------- Update / Insert ----------
    for v in variations:

        if v.id in variation_map:

            # Already exists
            variation_map[v.id]["qty"] += 1

        else:

            # New variation
            variation_map[v.id] = {
                "id": v.id,
                "category": v.variation_category,
                "value": v.variation_value,
                "qty": 1
            }


    # ---------- Save ----------
    cart_item.variations = list(variation_map.values())

    cart_item.quantity = sum(
        v["qty"] for v in cart_item.variations
    )

    cart_item.save()
    

    # ---------- Response ----------
    return Response({

        "status": 200,
        "message": "Product added to cart",

        "data": {
            "product": product.product_name,
            "total_quantity": cart_item.quantity,
            "variations": cart_item.variations
        }

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
   
    
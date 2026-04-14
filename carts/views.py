from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt

from store.models import Product, Variation
from .models import Cart, CartItem
from .serializer import VariationSerializer


# ============================================================
#  HELPER: Get cart_id from X-Cart-Id header
# ============================================================
def _cart_id(request):
    """
    Frontend sends a unique cart ID in the X-Cart-Id header.
    This ID is stored in localStorage — same browser = same ID always.
    No more session cookie problems!
    """
    cart_id = request.headers.get('X-Cart-Id', '')
    print(f"[CART ID] {cart_id}")
    return cart_id


# ============================================================
#  HELPER: Build the full cart response
# ============================================================
def _build_cart_response(cart):
    total = 0
    quantity = 0
    cart_items = []

    items = CartItem.objects.filter(cart=cart, is_active=True)

    for item in items:
        subtotal = item.product.price * item.quantity
        total += subtotal
        quantity += item.quantity

        cart_items.append({
            "product_id": item.product.id,
            "product_name": item.product.product_name,
            "price": item.product.price,
            "quantity": item.quantity,
            "subtotal": subtotal,
            "variations": item.variations,
        })

    return {
        "status": 200,
        "total": total,
        "quantity": quantity,
        "cart_items": cart_items,
    }


# ============================================================
#  HELPER: Parse variation IDs from request
# ============================================================
def _parse_variation_ids(raw_ids):
    if not raw_ids:
        return []
    if isinstance(raw_ids, list):
        return [int(i) for i in raw_ids]
    if isinstance(raw_ids, str):
        cleaned = raw_ids.strip("[] ")
        if not cleaned:
            return []
        return [int(i) for i in cleaned.split(",")]
    return []


# ============================================================
#  GET /cart/getAllVariation/
# ============================================================
@api_view(['GET'])
def getAllVariation(request):
    variations = Variation.objects.active()
    serializer = VariationSerializer(variations, many=True)
    return Response({"data": serializer.data})


# ============================================================
#  POST /cart/addProduct/<product_id>/
# ============================================================
@csrf_exempt
@api_view(['POST'])
def add_cart(request, product_id):
    product = get_object_or_404(Product, id=product_id)

    cart_id = _cart_id(request)
    if not cart_id:
        return Response({"status": 400, "message": "Missing X-Cart-Id header"}, status=400)

    cart, created = Cart.objects.get_or_create(cart_id=cart_id)
    print(f"[ADD] Cart {'created' if created else 'found'}: {cart_id}")

    # Parse variation IDs
    raw_ids = request.data.get('variations_id', [])
    variation_ids = _parse_variation_ids(raw_ids)
    print(f"[ADD] Variation IDs: {variation_ids}")

    if not variation_ids:
        return Response({
            "status": 400,
            "message": "Please select at least one variation (color, size, etc.)"
        }, status=400)

    valid_variations = Variation.objects.filter(
        id__in=variation_ids,
        is_active=True,
        product=product,
    )

    if not valid_variations.exists():
        return Response({
            "status": 404,
            "message": "No valid variations found for this product"
        }, status=404)

    # Get or create CartItem
    cart_item, _ = CartItem.objects.get_or_create(
        product=product,
        cart=cart,
        defaults={"quantity": 0, "variations": []},
    )

    # Update variation quantities
    variation_map = {int(v["id"]): v for v in (cart_item.variations or [])}

    for v in valid_variations:
        if v.id in variation_map:
            variation_map[v.id]["qty"] += 1
        else:
            variation_map[v.id] = {
                "id": v.id,
                "category": v.variation_category,
                "value": v.variation_value,
                "qty": 1,
            }

    cart_item.variations = list(variation_map.values())
    cart_item.quantity = sum(v["qty"] for v in cart_item.variations)
    cart_item.save()
    print(f"[ADD] Saved — qty: {cart_item.quantity}")

    return Response({
        "status": 200,
        "message": f"{product.product_name} added to cart!",
        "data": {
            "product": product.product_name,
            "total_quantity": cart_item.quantity,
            "variations": cart_item.variations,
        }
    })


# ============================================================
#  GET /cart/allCartItem/
# ============================================================
@api_view(['GET'])
def cart(request):
    cart_id = _cart_id(request)
    print(f"[CART] Looking for: {cart_id}")

    try:
        user_cart = Cart.objects.get(cart_id=cart_id)
        print(f"[CART] Found ✓")
        return Response(_build_cart_response(user_cart))
    except Cart.DoesNotExist:
        print(f"[CART] Not found — empty cart")
        return Response({
            "status": 200,
            "total": 0,
            "quantity": 0,
            "cart_items": [],
        })


# ============================================================
#  GET /cart/removeCartItem/<product_id>/
# ============================================================
@api_view(['GET'])
def remove_cart(request, product_id):
    user_cart = Cart.objects.get(cart_id=_cart_id(request))
    product = get_object_or_404(Product, id=product_id)
    cart_item = get_object_or_404(CartItem, product=product, cart=user_cart)

    if cart_item.quantity > 1:
        cart_item.quantity -= 1
        cart_item.save()
    else:
        cart_item.delete()

    return Response(_build_cart_response(user_cart))


# ============================================================
#  GET /cart/deleteCartItem/<product_id>/
# ============================================================
@api_view(['GET'])
def delete_cart(request, product_id):
    user_cart = Cart.objects.get(cart_id=_cart_id(request))
    product = get_object_or_404(Product, id=product_id)
    CartItem.objects.filter(cart=user_cart, product=product).delete()
    return Response(_build_cart_response(user_cart))


# ============================================================
#  GET /cart/  (health check)
# ============================================================
@csrf_exempt
@api_view(['GET'])
def temp(request):
    return Response({"status": 200, "message": "Cart API is running"})

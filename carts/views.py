from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import  IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from store.models import Product, Variation
from .models import Cart, CartItem
from .serializer import VariationSerializer, CartItemSerializer


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

def _get_or_create_cart(request):
    cart_id = request.headers.get('X-Cart-Id', '')
    if request.user.is_authenticated:
        cart = Cart.objects.filter(user=request.user).first()
        if cart:
            return cart
        else:
            cart_with_cart_id = Cart.objects.filter(cart_id = cart_id).first()
            if cart_with_cart_id:
                cart_with_cart_id.user = request.user
                cart_with_cart_id.save()
                return cart_with_cart_id
        cart = Cart.objects.create(user=request.user, cart_id = cart_id)
    else:
        cart, created = Cart.objects.get_or_create(cart_id=cart_id)
        if created:
            return cart


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
            "image": item.product.image.url if item.product.image else '',
            "image_url": item.product.image_url or '',
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
@authentication_classes([JWTAuthentication])
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

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
def add_to_cart(request, product_id ):
    cart_id = request.headers.get('X-Cart-Id', '')
    cart = _get_or_create_cart(request)
    variations_id = request.data.get('variations_id', [])
    variation_data = []
    for v in variations_id:
        try:
            variation = Variation.objects.get(id = v, product_id=product_id, is_active=True)
            variation_value = VariationSerializer(variation).data
            variation_data.append(variation_value)
        except Variation.DoesNotExist:
            return Response({"status": 400, "message": "Invalid Variation Id"})
    cart_Item, created = CartItem.objects.get_or_create(
        cart=cart, product_id=product_id,
        defaults={"quantity": 1, "variations": variation_data}
    )
    if not created:
        cart_Item.quantity += 1
        cart_Item.save()
    return Response({"status": 200, "data": {
    "product_id": cart_Item.product_id,
    "quantity": cart_Item.quantity,
    "variations": cart_Item.variations,
}})




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


@csrf_exempt
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def merge_cart(request):
    localCartId = request.headers.get('X-Cart-Id', '')
    if localCartId:
        try:
            localCart = Cart.objects.get(cart_id=localCartId)
            localCart.user = request.user
            localCart.save()
        except Exception as e:
            print(e)
            return Response({"status": 400, "message": "Invalid Cart Id"})
    return Response({"status": 200, "message": "Cart Added Successfully!"})

@csrf_exempt
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def getAllCatItem(request):
    user = request.user
    cartId = Cart.objects.filter(user=user).first()
    cartItem = CartItem.objects.filter(cart=cartId)
    serialize = CartItemSerializer(cartItem, many=True)
    return Response({"status": 200, "data": serialize.data})

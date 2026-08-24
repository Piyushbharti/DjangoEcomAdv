from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

from rest_framework import status
from django.shortcuts import get_object_or_404

from store.models import Product
from .models import RecentProductView
from .serializer import RecentProductViewSerializer


# Create your views here.

RECENT_LIMIT = 10

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def viewProduct(request):
    user = request.user
    product_id = request.data.get('product_id')

    if not product_id:
        return Response(
            {"status": 400, "message": "product_id is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    product = get_object_or_404(Product, id=product_id)

    recent, created = RecentProductView.objects.update_or_create(
        user=user,
        product=product,
    )

    return Response({
        "status": 200,
        "message": "Product view saved" if created else "Product view updated",
        "data": {
            "id": recent.id,
            "product_id": product.id,
            "product_name": product.product_name,
            "viewed_at": recent.viewed_at,
        }
    })


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def getRecentProducts(request):
    recents = RecentProductView.objects.filter(
        user=request.user
    ).select_related('product').order_by('-viewed_at')[:RECENT_LIMIT]

    serializer = RecentProductViewSerializer(recents, many=True)

    return Response({
        "status": 200,
        "count": len(serializer.data),
        "data": serializer.data
    })

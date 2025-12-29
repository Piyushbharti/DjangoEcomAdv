from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Product
from .serializer import ProductSerializer
# Create your views here.
@api_view(['GET'])
def getAllProduct(request):
    product = Product.objects.all().filter(is_available = True)
    serializer = ProductSerializer(product, many=True)
    return Response({"status":200, "data": serializer.data})

@api_view(['POST'])
def postNewProduct(request):
    serializer = ProductSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({
                "status": 201,
                "message": "Product created successfully",
                "data": serializer.data
            })
    return Response(
        {
            "status": 400,
            "errors": serializer.errors
        }
    )
    
@api_view(['PATCH'])
def update_product(request, product_id):
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response({"status": 404, "message": "Product not found"}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = ProductSerializer(product, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({"status": 200, "message": "Product updated", "data": serializer.data})
    return Response({"status": 400, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
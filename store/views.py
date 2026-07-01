from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Product, Variation
from category.models import Category
from orders.models import OrderItem
from .serializer import ProductSerializer, ProductWithVariationsSerializer, VariationSerializer
from django.core.paginator import Paginator
from django.db.models import Q
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Count


# Create your views here.
@api_view(['GET'])
def getAllProduct(request):
    product = Product.objects.all().filter(is_available = True)
    serializer = ProductWithVariationsSerializer(product, many=True)
    return Response({"status":200, "data": serializer.data})

@csrf_exempt
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
    
@csrf_exempt
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

@api_view(['GET'])
def getProductByCat(request, slug):
    try:
        categories = get_object_or_404(Category, slug=slug)
        products = Product.objects.filter(category=categories, is_available=True)
        serializer = ProductSerializer(products, many=True)
        
        return Response({"status": 200, "message": "Product updated", "data": serializer.data})
    except Product.DoesNotExist:
        return Response({"status": 404, "message": "Product not found"}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(['GET'])
def getAllProductByPagination(request):
    slug = request.GET.get('category')

    products = Product.objects.filter(is_available=True)

    if slug:
        category = get_object_or_404(Category, slug=slug)
        products = products.filter(category=category)

    paginator = Paginator(products, 3)
    page = request.GET.get('page', 3)
    paged_products = paginator.get_page(page)

    serializer = ProductSerializer(paged_products, many=True)

    return Response({
        "status": 200,
        "count": paginator.count,
        "total_pages": paginator.num_pages,
        "current_page": paged_products.number,
        "data": serializer.data
    })
    
@api_view(['GET'])
def searchProduct(request):
    keyword = request.GET.get('keyword')
    products = Product.objects.none()
    if keyword:
        products = Product.objects.filter(Q(product_name__icontains=keyword) | Q(category__category_name__icontains=keyword))
    paginator = Paginator(products, 1)
    page = request.GET.get('page',1)
    paged_products = paginator.get_page(page)
    serializer = ProductSerializer(paged_products, many=True)
    return Response({
        "status": 200,
        "count": paginator.count,
        "total_pages": paginator.num_pages,
        "current_page": paged_products.number,
        "data": serializer.data
    })

@api_view(['GET'])
def getSingleProductByCatV2(request, slug):

    product = get_object_or_404(Product, slug=slug)
    serializer = ProductWithVariationsSerializer(product)

    return Response(
        {"product": serializer.data},
        status=200
    )

@api_view(['GET'])
def getProductVariation(request, product_id):
    variations = Variation.objects.filter(product= product_id)
    serialize = VariationSerializer(variations, many=True)
    return Response({"status": 200, "data": serialize.data})

@api_view(['GET'])
def getRecommendedProduct(request, product_id):
    product = get_object_or_404(Product, id=product_id)

    user_orders = OrderItem.objects.filter(product=product_id).values_list('order__user', flat=True)
    
    other_products =   OrderItem.objects.filter(
        order__user__in=user_orders
    ).exclude(product=product_id).values('product').annotate(
        count=Count('product')
    ).order_by('-count')[:6]

    other_product_ids = [item['product'] for item in other_products]
    products = Product.objects.filter(id__in=other_product_ids, is_available=True)

    if not products.exists():
        products = Product.objects.filter(
            category=product.category, is_available=True
        ).exclude(id=product_id)[:6]

    serializer = ProductSerializer(products, many=True)
    return Response({'status': 200, 'data': serializer.data})



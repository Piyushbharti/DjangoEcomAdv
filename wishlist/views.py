from django.shortcuts import render
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from store.models import Product
from rest_framework.response import Response
from .models import WhishList
from .serializer import WhishlistSerializer

# Create your views here.
def cart_id(request):
    cart_id = request.headers.get('X-Cart-Id', '')
    return cart_id


@csrf_exempt
@api_view(['POST'])
def addProductToWhishList(request, product_id):
    cart_id = request.headers.get('X-Cart-Id', '')
    product = get_object_or_404(Product, id = product_id)
    item, created = WhishList.objects.get_or_create(cart_id = cart_id, product=product)
    if created:
        return Response({'status': 201, 'message': 'Success'})
    else:
        return Response({'status': 200, 'message': 'Success'})

@csrf_exempt
@api_view(['GET'])
def allWishListData(request):
    cart_id = request.headers.get('X-Cart-Id', '')
    data = WhishList.objects.filter(cart_id = cart_id)
    serialize = WhishlistSerializer(data, many=True)
    return Response({'data': serialize.data})

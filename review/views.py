from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from rest_framework.response import Response
from .serializer import ReviewSerializer
from rest_framework.decorators import api_view
from .models import ReviewModal
from store.models import Product
from django.shortcuts import get_object_or_404

# Create your views here.
@csrf_exempt
@api_view(['POST'])
def addReview(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    serialize = ReviewSerializer(data = request.data)
    if serialize.is_valid():
        serialize.save(product=product)
        return Response({'status': 201, 'message': 'Review added!', 'data': serialize.data})
    return Response({'status': 400, 'errors': serialize.errors})

@csrf_exempt
@api_view(['GET'])
def getAllReview(request):
    review = ReviewModal.objects.all()
    serialize = ReviewSerializer(review, many = True)
    return Response({'status': 200, 'data': serialize.data})
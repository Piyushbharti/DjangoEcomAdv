from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from rest_framework.response import Response
from .serializer import ReviewSerializer
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from .models import ReviewModal
from store.models import Product
from django.shortcuts import get_object_or_404
from rest_framework.permissions import  IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

# Create your views here.
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def addReview(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    serialize = ReviewSerializer(data = request.data)
    existingReview = ReviewModal.objects.filter(product = product_id, user=request.user).first()
    print("temp",serialize)
    if existingReview:
        return Response({'status': 409, 'message': "Review Already Exist"})
    if serialize.is_valid():
        serialize.save(product=product, user = request.user)
        return Response({'status': 201, 'message': 'Review added!', 'data': serialize.data})
    return Response({'status': 400, 'errors': serialize.errors})

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def getAllReview(request):
    product_id = request.data.get('product_id')
    review = ReviewModal.objects.filter(product = product_id).order_by('created_at')
    serialize = ReviewSerializer(review, many = True)
    return Response({'status': 200, 'data': serialize.data})


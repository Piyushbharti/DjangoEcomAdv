from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Category
from .serializer import CategorySerializer

# Create your views here.
@api_view(['GET'])
def getAllCategory(request):
    category = Category.objects.all()
    serializer = CategorySerializer(category, many=True)
    return Response({"status":200, "data": serializer.data})
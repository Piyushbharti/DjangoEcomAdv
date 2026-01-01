from rest_framework import serializers
from .models import Category

class CartSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'category_name']


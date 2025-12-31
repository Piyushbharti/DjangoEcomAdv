from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.ModelSerializer):
    category_slug = serializers.CharField(source = 'category.slug', read_only = True)
    class Meta:
        model = Product
        fields = "__all__"


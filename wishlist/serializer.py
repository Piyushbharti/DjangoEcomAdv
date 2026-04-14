from rest_framework import serializers
from .models import WhishList


class WhishlistSerializer(serializers.ModelSerializer):
    # Product ki info bhi response mein chahiye — sirf product_id nahi
    product_id = serializers.IntegerField(source='product.id', read_only=True)
    product_name = serializers.CharField(source='product.product_name', read_only=True)
    slug = serializers.CharField(source='product.slug', read_only=True)
    price = serializers.IntegerField(source='product.price', read_only=True)
    image = serializers.ImageField(source='product.image', read_only=True)
    stock = serializers.IntegerField(source='product.stock', read_only=True)
    in_stock = serializers.SerializerMethodField()

    class Meta:
        model = WhishList
        fields = [
            'id',
            'product_id',
            'product_name',
            'slug',
            'price',
            'image',
            'stock',
            'in_stock',
            'added_date',
        ]

    def get_in_stock(self, obj):
        return obj.product.stock > 0 and obj.product.is_available

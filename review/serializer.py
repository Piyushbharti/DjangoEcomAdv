from rest_framework import serializers
from .models import ReviewModal


class ReviewSerializer(serializers.ModelSerializer):
    # Product ki info bhi response mein chahiye
    product_name = serializers.CharField(source='product.product_name', read_only=True)
    product_slug = serializers.CharField(source='product.slug', read_only=True)

    class Meta:
        model = ReviewModal
        fields = [
            'id',
            'product',         # Product ID (write ke liye)
            'product_name',    # Product name (read ke liye)
            'product_slug',    # Product slug (read ke liye)
            'rating',
            'title',
            'comment',
            'image',
            'created_at',
        ]
        # product sirf create mein bhejo, response mein product_name dikhao
        extra_kwargs = {
            'product': {'write_only': True, 'required': False},
        }

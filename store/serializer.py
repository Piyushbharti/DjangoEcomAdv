from rest_framework import serializers
from .models import Product, Variation


class VariationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Variation
        fields = ['id', 'variation_category', 'variation_value', 'is_active']


class ProductSerializer(serializers.ModelSerializer):
    category_slug = serializers.CharField(source='category.slug', read_only=True)

    class Meta:
        model = Product
        fields = "__all__"


class ProductWithVariationsSerializer(serializers.ModelSerializer):
    variations = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.category_name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'product_name',
            'slug',
            'description',
            'price',
            'image',
            'stock',
            'is_available',
            'category',
            'category_name',
            'category_slug',
            'variations',
        ]

    def get_variations(self, obj):
        """Return variations grouped by category using the manager"""
        active_variations = Variation.objects.filter(
            product=obj, is_active=True
        )

        grouped = {}
        for v in active_variations:
            cat = v.variation_category
            if cat not in grouped:
                grouped[cat] = []
            grouped[cat].append(VariationSerializer(v).data)

        return grouped

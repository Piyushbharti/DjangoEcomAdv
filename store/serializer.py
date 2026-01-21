from rest_framework import serializers
from .models import Product, Variation

class ProductSerializer(serializers.ModelSerializer):
    category_slug = serializers.CharField(source = 'category.slug', read_only = True)
    class Meta:
        model = Product
        fields = "__all__"

class ProductWithVariationsSerializer(serializers.ModelSerializer):
    variations = serializers.SerializerMethodField()

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
            'variations'
        ]

    def get_variations(self, obj):
        variations = Variation.objects.filter(
            product=obj,
            is_active=True
        )

        variation_dict = {}

        for variation in variations:
            category = variation.variation_category
            if category not in variation_dict:
                variation_dict[category] = []

            variation_dict[category].append(
                VariationSerializer(variation).data
            )

        return variation_dict


class VariationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Variation
        fields = "__all__"

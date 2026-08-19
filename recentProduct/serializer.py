from rest_framework import serializers
from store.serializer import ProductSerializer
from .models import RecentProductView


class RecentProductViewSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = RecentProductView
        fields = ['id', 'product', 'viewed_at']

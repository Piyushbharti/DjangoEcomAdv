from rest_framework import serializers
from .models import FlashSale, FlashSaleProduct
from store.serializer import ProductSerializer


class FlashSaleProductSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    
    class Meta:
        model = FlashSaleProduct
        fields = "__all__"

class FlashSaleSerializer(serializers.ModelSerializer):
    flash_products = FlashSaleProductSerializer(read_only=True, many=True)
    
    class Meta:
        model = FlashSale
        fields = "__all__"
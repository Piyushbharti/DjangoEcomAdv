from rest_framework import serializers
from store.models import Variation
from store.serializer import ProductSerializer


class VariationSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only = True)
    class Meta:
        model = Variation
        fields = '__all__'
        

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSerializer
        fields = '__all__'
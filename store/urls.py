from django.urls import path
from .views import getAllProduct, postNewProduct, update_product

urlpatterns = [
    path('getAllProduct/', getAllProduct),
    path('addProduct/', postNewProduct),
    path('updateProduct/<int:product_id>', update_product),
]

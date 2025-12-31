from django.urls import path
from .views import getAllProduct, postNewProduct, update_product, getProductByCat

urlpatterns = [
    path('getAllProduct/', getAllProduct),
    path('addProduct/', postNewProduct),
    path('updateProduct/<int:product_id>', update_product),
    path('productBySlug/<slug:slug>', getProductByCat),
]

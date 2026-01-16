from django.urls import path
from .views import getAllProduct, postNewProduct, update_product, getProductByCat,getAllProductByPagination, searchProduct, getSingleProductByCatV2

urlpatterns = [
    path('getAllProduct/', getAllProduct),
    path('addProduct/', postNewProduct),
    path('updateProduct/<int:product_id>', update_product),
    path('productBySlug/<slug:slug>', getProductByCat),
    path('productBySlugv2/<slug:slug>', getSingleProductByCatV2),
    path('allProduct/', getAllProductByPagination),
    path('search/', searchProduct),
]

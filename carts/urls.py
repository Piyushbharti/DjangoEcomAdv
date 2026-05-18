from django.urls import path
from .views import temp, add_cart, add_to_cart, cart, remove_cart, delete_cart, getAllVariation, merge_cart, getAllCatItem

urlpatterns = [
     path('', temp),
     path('addProduct/<int:product_id>/', add_cart),
     path('add_to_cart/<int:product_id>/', add_to_cart),
     path('allCartItem/', cart),
     path('getAllVariation/', getAllVariation),
     path('removeCartItem/<int:product_id>/', remove_cart),
     path('deleteCartItem/<int:product_id>/', delete_cart),
     path('merge/', merge_cart),
     path('getAllCatItem/', getAllCatItem),
]

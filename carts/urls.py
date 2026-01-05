from django.urls import path
from .views import temp, add_cart, cart, remove_cart, delete_cart
urlpatterns = [
     path('', temp),
     path('addProduct/<int:product_id>', add_cart),
     path('allCartItem', cart),
     path('removeCartItem/<int:product_id>', remove_cart),
     path('deleteCartItem/<int:product_id>', delete_cart),
]

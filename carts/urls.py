from django.urls import path
from .views import temp, add_cart, cart
urlpatterns = [
     path('', temp),
     path('addProduct/<int:product_id>', add_cart),
     path('allCartItem', cart)
]

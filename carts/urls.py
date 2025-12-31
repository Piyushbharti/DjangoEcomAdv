from django.urls import path
from .views import temp, add_cart
urlpatterns = [
     path('', temp),
     path('addProduct/<int:product_id>', add_cart),
]

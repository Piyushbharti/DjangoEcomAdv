from django.urls import path
from .views import create_order, get_my_orders

urlpatterns = [
    path('create/', create_order),
    path('my-orders/', get_my_orders),
]

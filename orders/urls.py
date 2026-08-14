from django.urls import path
from .views import create_order, get_my_orders, track_order

urlpatterns = [
    path('create/', create_order),
    path('my-orders/', get_my_orders),
    path('track/<str:order_number>/', track_order),
]

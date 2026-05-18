from django.urls import path
from .views import Order

urlpatterns = [
    path('create/', Order),
]

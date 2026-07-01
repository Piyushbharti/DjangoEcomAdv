from .views import applyCoupon
from django.urls import path

urlpatterns = [
    path('apply', applyCoupon)
]
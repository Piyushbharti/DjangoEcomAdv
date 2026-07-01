from .views import applyCoupon, addCoupon
from django.urls import path

urlpatterns = [
    path('apply', applyCoupon),
    path('addCoupon', addCoupon),
]
from .views import applyCoupon, addCoupon, listCoupons
from django.urls import path

urlpatterns = [
    path('addCoupon', addCoupon),
    path('applyCoupon', applyCoupon),
    path('listCoupons', listCoupons),
]
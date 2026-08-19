from django.urls import path
from .views import viewProduct, getRecentProducts

urlpatterns = [
    path('viewProduct/', viewProduct),
    path('getRecentProducts/', getRecentProducts),
]

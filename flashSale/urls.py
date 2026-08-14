from django.urls import path
from .views import getActiveSales

urlpatterns = [
    path('getActiveSales/', getActiveSales)
]
from django.urls import path
from .views import getAllCategory

urlpatterns = [
    path('getAllCategory/', getAllCategory),
]

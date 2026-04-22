from django.urls import path
from .views import addReview, getAllReview

urlpatterns = [
    path('addReview/<int:product_id>/', addReview),
    path('getAllReview/', getAllReview),
]
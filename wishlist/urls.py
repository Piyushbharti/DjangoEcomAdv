from django.urls import path
from .views import addProductToWhishList, allWishListData

urlpatterns = [
    path('addToWishlist/<int:product_id>/', addProductToWhishList),
    path('all/', allWishListData)
]
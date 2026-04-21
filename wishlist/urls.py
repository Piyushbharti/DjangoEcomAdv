from django.urls import path
from .views import addProductToWhishList, allWishListData, deleteWishListData, delAllWishListData

urlpatterns = [
    path('addToWishlist/<int:product_id>/', addProductToWhishList),
    path('deleteWishlist/<int:product_id>/', deleteWishListData),
    path('dropWishList', delAllWishListData),
    path('all/', allWishListData)
]
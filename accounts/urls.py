from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import register, login, get_user

urlpatterns = [
    # Custom: Register
    path('register/', register),
    
    # Custom: Login (email + password → tokens)
    path('login/', login),
    path('get-user/', get_user),
    # Built-in: Refresh (refresh token → new access token)
    path('token/refresh/', TokenRefreshView.as_view()),
]

from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import register

urlpatterns = [
    # Custom: Register
    path('register/', register),
    
    # Built-in: Login (email + password → tokens)
    path('login/', TokenObtainPairView.as_view()),
    
    # Built-in: Refresh (refresh token → new access token)
    path('token/refresh/', TokenRefreshView.as_view()),
]

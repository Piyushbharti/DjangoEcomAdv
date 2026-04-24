from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import register, login

urlpatterns = [
    # Custom: Register
    path('register/', register),
    
    # Custom: Login (email + password → tokens)
    path('login/', login),
    
    # Built-in: Refresh (refresh token → new access token)
    path('token/refresh/', TokenRefreshView.as_view()),
]

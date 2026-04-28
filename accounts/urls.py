from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import register, login, get_user, update_user_data, update_password

urlpatterns = [
    # Custom: Register
    path('register/', register),
    
    # Custom: Login (email + password → tokens)
    path('login/', login),
    path('get-user/', get_user),
    path('update-user/', update_user_data),
    path('update-pass/', update_password),
    # Built-in: Refresh (refresh token → new access token)
    path('token/refresh/', TokenRefreshView.as_view()),
]

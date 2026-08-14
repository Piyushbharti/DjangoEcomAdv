from django.urls import path
from .views import stockNotifier

urlpatterns = [
    path('notifyMe/', stockNotifier)
]
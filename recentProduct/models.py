from django.db import models
from store.models import Product
from accounts.models import Account

# Create your models here.
class RecentProductView(models.Model):
    user_id = models.ForeignKey(Account, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    viewed_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    

from django.db import models
from accounts.models import Account
from store.models import Product
# Create your models here.
class StockNotification(models.Model):
    user = models.ForeignKey(Account, on_delete = models.CASCADE)
    product = models.ForeignKey(Product, on_delete = models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'product')


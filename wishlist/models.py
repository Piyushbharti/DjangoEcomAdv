from django.db import models
from store.models import Product
from accounts.models import Account

# Create your models here.
class WhishList(models.Model):
    user = models.ForeignKey(Account, on_delete=models.CASCADE, null=True, blank=True)
    product = models.ForeignKey(Product, on_delete= models.CASCADE)
    added_date = models.DateField(auto_now_add=True)
    class Meta:
        unique_together = ('user', 'product')
        

from django.db import models
from store.models import Product

# Create your models here.
class WhishList(models.Model):
    cart_id = models.CharField(max_length=100)
    product = models.ForeignKey(Product, on_delete= models.CASCADE)
    added_date = models.DateField(auto_now_add=True)
    class Meta:
        unique_together = ('cart_id', 'product')
        

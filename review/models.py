from django.db import models
from store.models import Product
from accounts.models import Account
# Create your models here.
class ReviewModal(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    title = models.CharField(max_length=100)
    comment = models.TextField()
    image = models.ImageField(upload_to='photos/reviews', blank=True)
    rating = models.IntegerField()
    user = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='reviews')
    created_at = models.DateTimeField(auto_now_add = True)
    class Meta:
        unique_together = ('user', 'product')


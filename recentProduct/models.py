from django.db import models
from store.models import Product
from accounts.models import Account

# Create your models here.
class RecentProductView(models.Model):
    user = models.ForeignKey(
        Account,
        on_delete=models.CASCADE,
        related_name='recent_views'
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='recent_views'
    )
    viewed_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product')
        ordering = ['-viewed_at']

    def __str__(self):
        return f"{self.user.email} viewed {self.product.product_name}"

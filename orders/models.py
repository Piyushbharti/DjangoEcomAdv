from django.db import models
from accounts.models import Account
from store.models import Product
from django.utils import timezone

# Create your models here.
class Order(models.Model):
    user = models.ForeignKey(Account, on_delete=models.CASCADE)
    order_number = models.CharField(max_length=20, unique=True, blank=True)
    shipping_address = models.JSONField(default=dict)
    payment_info = models.JSONField(default=dict)
    status = models.CharField(max_length=20, default='pending')
    total = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = self._generate_order_number()
        super().save(*args, **kwargs)

    def  _generate_order_number(self):
        year = timezone.now().year
        lastOrd = Order.objects.filter(order_number__startswith = f"ORD-{year}").order_by('-order_number').first()
        if lastOrd:
            last_num = int(lastOrd.order_number.split('-')[-1])
            new_num = last_num + 1
        else:
            new_num = 1
        return f"ORD-{year}-{new_num:05d}"
    def __str__(self):
        return self.order_number


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    product_name = models.CharField(max_length=200)
    product_price = models.IntegerField()
    quantity = models.IntegerField()
    variations = models.JSONField(default=list)

    def __str__(self):
        return f"{self.product_name} x {self.quantity}"

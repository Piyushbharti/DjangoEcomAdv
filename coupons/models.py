from django.db import models
from accounts.models import Account

# Create your models here.
class Coupon(models.Model):
    DISCOUNT_TYPES = [
        ('flat', 'Flat Amount'),
        ('percent', 'Percentage'),
    ]
    code = models.CharField(max_length=20, unique=True)
    discount_type = models.CharField(max_length=10, choices=DISCOUNT_TYPES)
    discount_value = models.IntegerField()
    valid_from = models.DateTimeField()
    valid_until = models.DateTimeField()
    min_order_amount = models.IntegerField()
    first_order_only = models.BooleanField()
    used_count = models.IntegerField()
    is_active = models.BigIntegerField(default=True)
    max_discount = models.IntegerField(null = True, blank=True)
    def __str__(self):
        return self.code

class CouponUsage(models.Model):
    coupon = models.ForeignKey(Coupon, on_delete=models.CASCADE)
    user = models.ForeignKey(Account, on_delete=models.CASCADE)
    used_at = models.DateTimeField(auto_now_add=True)

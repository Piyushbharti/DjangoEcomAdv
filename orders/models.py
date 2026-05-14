from django.db import models

# Create your models here.
class Order(models.Model):
    user = models.ForeignKey(Account, on_delete=models.CASCADE)
    order_number = models.CharField(max_length=20, unique=True)
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
        pass

    def __str__(self):
        return self.name

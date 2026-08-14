from django.db import models
from store.models import Product


class FlashSale(models.Model):
    name = models.CharField(max_length=255)
    status = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name


class FlashSaleProduct(models.Model):
    flash_sale = models.ForeignKey(
        FlashSale,
        on_delete=models.CASCADE,
        related_name="flash_products"
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE
    )
    sale_price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    
    def __str__(self):
        return f"{self.product.product_name} - ₹{self.sale_price}"
from django.db import models
from category.models import Category


class Product(models.Model):
    product_name = models.CharField(max_length=200, unique=True)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField(max_length=500, blank=True)
    price = models.IntegerField()
    image = models.ImageField(upload_to='photos/products')
    stock = models.IntegerField()
    is_available = models.BooleanField(default=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    created_date = models.DateTimeField(auto_now_add=True)
    modified_date = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_date']

    def __str__(self):
        return self.product_name

    def get_active_variations(self):
        """Get all active variations grouped by category"""
        return self.variations.filter(is_active=True)

    def has_variation(self, category):
        """Check if product has a specific variation category"""
        return self.variations.filter(
            variation_category=category, is_active=True
        ).exists()


# ---- Variation Manager ----
class VariationManager(models.Manager):
    def colors(self):
        return self.filter(variation_category='color', is_active=True)

    def sizes(self):
        return self.filter(variation_category='size', is_active=True)

    def weights(self):
        return self.filter(variation_category='weight', is_active=True)

    def active(self):
        return self.filter(is_active=True)

    def by_category(self, category):
        return self.filter(variation_category=category, is_active=True)


VARIATION_CATEGORY_CHOICE = (
    ('color', 'Color'),
    ('size', 'Size'),
    ('weight', 'Weight'),
    ('material', 'Material'),
    ('style', 'Style'),
)


class Variation(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='variations'
    )
    variation_category = models.CharField(
        max_length=100,
        choices=VARIATION_CATEGORY_CHOICE
    )
    variation_value = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    created_date = models.DateField(auto_now_add=True)

    objects = VariationManager()

    class Meta:
        unique_together = ('product', 'variation_category', 'variation_value')
        ordering = ['variation_category', 'variation_value']

    def __str__(self):
        return f"{self.product.product_name} - {self.variation_category}: {self.variation_value}"

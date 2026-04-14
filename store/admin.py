from django.contrib import admin
from .models import Product, Variation


class VariationInline(admin.TabularInline):
    model = Variation
    extra = 1
    fields = ('variation_category', 'variation_value', 'is_active')


class ProductAdmin(admin.ModelAdmin):
    list_display = ('product_name', 'slug', 'price', 'stock', 'category', 'modified_date', 'is_available')
    prepopulated_fields = {'slug': ('product_name',)}
    inlines = [VariationInline]


class VariationAdmin(admin.ModelAdmin):
    list_display = ('product', 'variation_category', 'variation_value', 'is_active')
    list_filter = ('variation_category', 'is_active', 'product')
    list_editable = ('is_active',)
    search_fields = ('product__product_name', 'variation_value')


admin.site.register(Product, ProductAdmin)
admin.site.register(Variation, VariationAdmin)

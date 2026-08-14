from django.contrib import admin
from .models import FlashSale, FlashSaleProduct

# Register your models here.

# Inline for FlashSaleProduct inside FlashSale admin
class FlashSaleProductInline(admin.TabularInline):
    model = FlashSaleProduct
    extra = 1
    fields = ['product', 'sale_price', 'start_date', 'end_date']
    autocomplete_fields = ['product']

@admin.register(FlashSale)
class FlashSaleAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['name']
    readonly_fields = ['created_at']
    inlines = [FlashSaleProductInline]

@admin.register(FlashSaleProduct)
class FlashSaleProductAdmin(admin.ModelAdmin):
    list_display = ['id', 'flash_sale', 'product', 'sale_price', 'start_date', 'end_date']
    list_filter = ['flash_sale', 'start_date', 'end_date']
    search_fields = ['product__product_name', 'flash_sale__name']
    autocomplete_fields = ['product']

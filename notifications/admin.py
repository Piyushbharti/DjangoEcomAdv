from django.contrib import admin
from .models import StockNotification

# Register your models here.

@admin.register(StockNotification)
class StockNotificationAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'product', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__email', 'user__first_name', 'product__product_name']
    readonly_fields = ['created_at']
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('user', 'product')


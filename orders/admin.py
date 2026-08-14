from django.contrib import admin
from .models import Order, OrderItem, OrderStatusHistory


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['product', 'product_name', 'product_price', 'quantity', 'variations']


class OrderStatusHistoryInline(admin.TabularInline):
    model = OrderStatusHistory
    extra = 0
    readonly_fields = ['status', 'note', 'changed_by', 'created_at']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'user', 'status', 'total', 'created_at', 'updated_at']
    list_filter = ['status', 'created_at']
    search_fields = ['order_number', 'user__email', 'user__first_name']
    list_editable = ['status']
    readonly_fields = ['order_number', 'user', 'total', 'shipping_address', 'payment_info', 'created_at', 'updated_at']
    inlines = [OrderItemInline, OrderStatusHistoryInline]

    def save_model(self, request, obj, form, change):
        if change and 'status' in form.changed_data:
            # Log status change in history
            OrderStatusHistory.objects.create(
                order=obj,
                status=obj.status,
                changed_by=request.user.email or request.user.username,
                note=f"Status changed to {obj.get_status_display()} via admin"
            )
        super().save_model(request, obj, form, change)


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['order', 'product_name', 'product_price', 'quantity']


@admin.register(OrderStatusHistory)
class OrderStatusHistoryAdmin(admin.ModelAdmin):
    list_display = ['order', 'status', 'changed_by', 'created_at']
    list_filter = ['status', 'created_at']
    readonly_fields = ['order', 'status', 'note', 'changed_by', 'created_at']

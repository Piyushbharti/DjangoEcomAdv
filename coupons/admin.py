from django.contrib import admin
from .models import Coupon, CouponUsage


class CouponAdmin(admin.ModelAdmin):
    list_display = ['code', 'discount_type', 'discount_value', 'valid_from', 'valid_until', 'is_active', 'used_count']
    list_filter = ['discount_type', 'is_active', 'first_order_only']
    search_fields = ['code']
    list_editable = ['is_active']


class CouponUsageAdmin(admin.ModelAdmin):
    list_display = ['coupon', 'user', 'used_at']
    list_filter = ['coupon']


admin.site.register(Coupon, CouponAdmin)
admin.site.register(CouponUsage, CouponUsageAdmin)

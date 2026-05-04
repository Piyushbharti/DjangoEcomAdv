from django.contrib import admin
from .models import Account, OTP
from django.contrib.auth.admin import UserAdmin

class AccountAdmin(UserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'username', 'last_login', 'date_joined', 'is_active')
    filter_horizontal = ()
    list_filter = ()
    fieldsets = ()

class OTPAdmin(admin.ModelAdmin):
    list_display = ('email', 'otp', 'created_at')
    search_fields = ('email',)

admin.site.register(Account, AccountAdmin)
admin.site.register(OTP, OTPAdmin)
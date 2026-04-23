from django.contrib import admin

# Register your models here.
from .models import UserModel
# Register your models here.
class UserAdmin(admin.ModelAdmin):
    list_display = ('firstName', 'lastName', 'email', 'password', 'created_at')
admin.site.register(UserModel, UserAdmin)
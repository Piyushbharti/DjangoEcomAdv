from django.contrib import admin
from .models import WhishList
# Register your models here.
class WhishListAdmin(admin.ModelAdmin):
    list_display = ('cart_id', 'added_date', 'product')
admin.site.register(WhishList, WhishListAdmin)
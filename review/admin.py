from django.contrib import admin
from .models import ReviewModal


class ReviewAdmin(admin.ModelAdmin):
    list_display = ['id', 'product', 'rating', 'title', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['title', 'comment']
    readonly_fields = ['created_at']


admin.site.register(ReviewModal, ReviewAdmin)

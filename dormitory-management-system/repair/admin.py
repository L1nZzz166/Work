from django.contrib import admin
from .models import Repair


@admin.register(Repair)
class RepairAdmin(admin.ModelAdmin):
    list_display = ['title', 'student', 'dormitory', 'status', 'create_time']
    list_filter = ['status', 'dormitory__building', 'create_time']
    search_fields = ['title', 'description', 'student__name']

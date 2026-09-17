from django.contrib import admin
from .models import Dormitory


@admin.register(Dormitory)
class DormitoryAdmin(admin.ModelAdmin):
    list_display = ['building', 'room_number', 'floor', 'capacity', 'current_count', 'room_type']
    list_filter = ['building', 'room_type', 'floor']
    search_fields = ['room_number', 'description']

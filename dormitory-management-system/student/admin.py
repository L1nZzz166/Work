from django.contrib import admin
from .models import Student


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['name', 'student_id', 'gender', 'phone', 'email', 'check_in_date', 'dormitory']
    list_filter = ['gender', 'check_in_date', 'dormitory__building']
    search_fields = ['name', 'student_id', 'phone', 'email']

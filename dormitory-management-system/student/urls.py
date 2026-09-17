from django.urls import path
from . import views

app_name = 'student'
urlpatterns = [
    path('', views.student_list, name='list'),
    path('add/', views.student_add, name='add'),
    path('edit/<int:pk>/', views.student_edit, name='edit'),
    path('delete/<int:pk>/', views.student_delete, name='delete'),
]

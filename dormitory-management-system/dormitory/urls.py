from django.urls import path
from . import views

app_name = 'dormitory'
urlpatterns = [
    path('', views.dormitory_list, name='list'),
    path('add/', views.dormitory_add, name='add'),
    path('detail/<int:pk>/', views.dormitory_detail, name='detail'),
    path('delete/<int:pk>/', views.dormitory_delete, name='delete'),
]

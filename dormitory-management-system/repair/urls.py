from django.urls import path
from . import views

app_name = 'repair'
urlpatterns = [
    path('', views.repair_list, name='list'),
    path('add/', views.repair_add, name='add'),
    path('detail/<int:pk>/', views.repair_detail, name='detail'),
    path('complete/<int:pk>/', views.repair_complete, name='complete'),
]

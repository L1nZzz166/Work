from django.urls import path
from . import views

app_name = 'home'
urlpatterns = [
    path('login/', views.user_login, name='login'),
    path('guest-login/', views.guest_login, name='guest_login'),
    path('logout/', views.user_logout, name='logout'),
    path('', views.index, name='index'),
]

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('home.urls')),
    path('student/', include('student.urls')),
    path('dormitory/', include('dormitory.urls')),
    path('repair/', include('repair.urls')),
]

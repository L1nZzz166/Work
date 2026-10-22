# -*- coding: utf-8 -*-
from rest_framework import routers

from tourism.views import ScenicSpotViewSet

tourism_url = routers.SimpleRouter()
tourism_url.register(r'scenic', ScenicSpotViewSet, basename='scenic')

urlpatterns = tourism_url.urls

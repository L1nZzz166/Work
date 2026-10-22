# -*- coding: utf-8 -*-
"""旅游景点序列化器"""
from rest_framework import serializers
from tourism.models import ScenicSpot


class ScenicSpotSerializer(serializers.ModelSerializer):
    def __init__(self, instance=None, data=serializers.empty, request=None, **kwargs):
        super().__init__(instance=instance, data=data, **kwargs)
        self.request = request or self.context.get("request", None)

    class Meta:
        model = ScenicSpot
        fields = '__all__'

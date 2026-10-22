# -*- coding: utf-8 -*-
"""
@Remark: 旅游景点过滤器
"""
from django_filters import rest_framework as filters

from tourism.models import ScenicSpot


class ScenicSpotFilter(filters.FilterSet):
    """支持按地区、等级、类型、标签、名称模糊过滤"""
    name = filters.CharFilter(field_name="name", lookup_expr="icontains")
    region_name = filters.CharFilter(field_name="region_name", lookup_expr="icontains")
    level = filters.CharFilter(field_name="level", lookup_expr="iexact")
    type_desc = filters.CharFilter(field_name="type_desc", lookup_expr="icontains")
    tags = filters.CharFilter(method="filter_tags")

    def filter_tags(self, queryset, name, value):
        """按标签模糊匹配（tags 字段存的是 JSON 数组字符串）"""
        return queryset.filter(tags__icontains=value)

    class Meta:
        model = ScenicSpot
        fields = ["name", "region_name", "level", "type_desc", "tags", "hot_score", "review_score"]

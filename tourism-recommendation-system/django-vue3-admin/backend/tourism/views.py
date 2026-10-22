# -*- coding: utf-8 -*-
"""
@Remark: 旅游景点管理 + 推荐接口
"""
import json
from collections import Counter

from django.db.models import Count, Sum, Avg
from rest_framework.decorators import action

from dvadmin.utils.json_response import SuccessResponse
from dvadmin.utils.viewset import CustomModelViewSet
from tourism.filters import ScenicSpotFilter
from tourism.models import ScenicSpot
from tourism.serializers import ScenicSpotSerializer

# 综合评分权重：热度 50%、评论分 30%、评论数量 20%
_W_HOT = 0.5
_W_SCORE = 0.3
_W_REVIEW = 0.2


def _parse_tags(raw):
    """解析 tags 字段为标签列表"""
    if not raw:
        return []
    try:
        data = json.loads(raw)
        return data if isinstance(data, list) else [data]
    except (ValueError, TypeError):
        return []


def _composite_score(obj):
    """
    计算综合推荐得分（0-10）：
    - 热度评分（0-10）
    - 评论分（0-5，乘 2 归一化到 0-10）
    - 评论数量（对数归一化到 0-10）
    """
    hot = obj.hot_score or 0
    score = (obj.review_score or 0) * 2
    import math
    review = math.log10((obj.review_count or 0) + 1) / 6 * 10  # 60万条评论 → 接近满分
    review = min(review, 10)
    return round(_W_HOT * hot + _W_SCORE * score + _W_REVIEW * review, 2)


class ScenicSpotViewSet(CustomModelViewSet):
    """
    旅游景点管理
    list: 查询列表（支持按名称/地区/等级/标签等过滤）
    create: 新增景点
    update: 修改景点
    retrieve: 单例
    destroy: 删除景点
    recommend: 综合推荐
    top: 热门景点排行
    similar: 相似景点推荐（基于标签）
    stats: 可视化统计聚合
    regions: 地区列表
    """
    queryset = ScenicSpot.objects.all()
    serializer_class = ScenicSpotSerializer
    filterset_class = ScenicSpotFilter
    search_fields = ["name", "region_name", "district", "level", "category", "type_desc"]
    ordering_fields = ["hot_score", "review_score", "review_count", "ticket_price", "id"]
    # 旅游数据为批量导入，无需按部门/创建人做数据权限过滤
    extra_filter_class = []

    def _filter_queryset(self, request):
        """根据推荐参数过滤"""
        queryset = ScenicSpot.objects.all()
        region = request.query_params.get("region") or request.query_params.get("region_name")
        level = request.query_params.get("level")
        tag = request.query_params.get("tag")
        if region:
            queryset = queryset.filter(region_name__icontains=region)
        if level:
            queryset = queryset.filter(level__iexact=level)
        if tag:
            queryset = queryset.filter(tags__icontains=tag)
        return queryset

    @action(methods=["get"], detail=False)
    def recommend(self, request):
        """综合推荐：按 热度/评论分/评论数 加权综合得分降序"""
        limit = int(request.query_params.get("limit", 10))
        limit = min(max(limit, 1), 100)
        queryset = self._filter_queryset(request)[:500]
        items = []
        for obj in queryset:
            data = ScenicSpotSerializer(obj).data
            data["composite_score"] = _composite_score(obj)
            items.append(data)
        items.sort(key=lambda x: x["composite_score"], reverse=True)
        return SuccessResponse(data=items[:limit], msg="推荐成功")

    @action(methods=["get"], detail=False)
    def top(self, request):
        """热门景点排行：按热度评分降序"""
        limit = int(request.query_params.get("limit", 10))
        limit = min(max(limit, 1), 100)
        queryset = self._filter_queryset(request).order_by("-hot_score", "-review_count")[:limit]
        serializer = self.get_serializer(queryset, many=True)
        return SuccessResponse(data=serializer.data, msg="查询成功")

    @action(methods=["get"], detail=False)
    def similar(self, request):
        """相似景点推荐：根据某个景点的标签推荐相似景点"""
        limit = int(request.query_params.get("limit", 10))
        limit = min(max(limit, 1), 100)
        scenic_id = request.query_params.get("id")
        name = request.query_params.get("name")
        if scenic_id:
            source = ScenicSpot.objects.filter(id=scenic_id).first()
        else:
            source = ScenicSpot.objects.filter(name__icontains=name).first() if name else None
        if not source:
            return SuccessResponse(data=[], msg="未找到参照景点，请传 id 或 name 参数")
        source_tags = _parse_tags(source.tags)
        if not source_tags:
            return SuccessResponse(data=[], msg="该景点没有标签，无法做相似推荐")
        queryset = ScenicSpot.objects.exclude(id=source.id)
        for tag in source_tags:
            queryset = queryset.filter(tags__icontains=tag)
        # 用热度和评论分兜底排序，保证结果质量
        queryset = queryset.order_by("-hot_score", "-review_count")[:limit]
        serializer = self.get_serializer(queryset, many=True)
        return SuccessResponse(data=serializer.data, msg="相似推荐成功")

    @action(methods=["get"], detail=False)
    def stats(self, request):
        """可视化统计聚合：地区/等级/类型/标签分布 + 均价 + 热度榜"""
        queryset = ScenicSpot.objects.all()
        total = queryset.count()

        # 地区分布 TOP20
        region_distribution = list(
            queryset.values("region_name")
            .annotate(count=Count("id"))
            .order_by("-count")[:20]
        )
        # 景区等级分布
        level_distribution = list(
            queryset.exclude(level__isnull=True).exclude(level="")
            .values("level")
            .annotate(count=Count("id"))
            .order_by("-count")
        )
        # 类型分布
        type_distribution = list(
            queryset.exclude(type_desc__isnull=True).exclude(type_desc="")
            .values("type_desc")
            .annotate(count=Count("id"))
            .order_by("-count")
        )
        # 标签 TOP20（tags 为 JSON 数组字符串，逐条解析）
        tag_counter = Counter()
        for tags_raw in queryset.exclude(tags__isnull=True).values_list("tags", flat=True):
            for tag in _parse_tags(tags_raw):
                tag_counter[tag] += 1
        top_tags = [{"tag": tag, "count": cnt} for tag, cnt in tag_counter.most_common(20)]

        # 总体指标
        avg_review_score = queryset.filter(review_score__isnull=False).aggregate(Avg("review_score"))["review_score__avg"]
        avg_hot_score = queryset.filter(hot_score__isnull=False).aggregate(Avg("hot_score"))["hot_score__avg"]
        total_review_count = queryset.filter(review_count__isnull=False).aggregate(Sum("review_count"))["review_count__sum"] or 0

        # 门票价格分布
        price_distribution = [
            {"range": "免费", "count": queryset.filter(ticket_price=0).count()},
            {"range": "0-50元", "count": queryset.filter(ticket_price__gt=0, ticket_price__lte=50).count()},
            {"range": "50-100元", "count": queryset.filter(ticket_price__gt=50, ticket_price__lte=100).count()},
            {"range": "100-200元", "count": queryset.filter(ticket_price__gt=100, ticket_price__lte=200).count()},
            {"range": "200元以上", "count": queryset.filter(ticket_price__gt=200).count()},
        ]

        # 评论量 TOP 城市
        top_regions_by_review = list(
            queryset.values("region_name")
            .annotate(total_review=Sum("review_count"))
            .order_by("-total_review")[:10]
        )

        data = {
            "total": total,
            "region_distribution": region_distribution,
            "level_distribution": level_distribution,
            "type_distribution": type_distribution,
            "top_tags": top_tags,
            "avg_review_score": round(avg_review_score, 2) if avg_review_score else 0,
            "avg_hot_score": round(avg_hot_score, 2) if avg_hot_score else 0,
            "total_review_count": total_review_count,
            "price_distribution": price_distribution,
            "top_regions_by_review": top_regions_by_review,
        }
        return SuccessResponse(data=data, msg="统计成功")

    @action(methods=["get"], detail=False)
    def regions(self, request):
        """地区列表（用于下拉筛选）"""
        queryset = (
            ScenicSpot.objects.values("region_name", "region_en")
            .annotate(count=Count("id"))
            .order_by("-count")
        )
        return SuccessResponse(data=list(queryset), msg="查询成功")

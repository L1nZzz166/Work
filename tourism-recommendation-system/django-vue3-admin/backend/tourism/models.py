# -*- coding: utf-8 -*-
"""
@Remark: 旅游景点数据模型（数据来源：携程旅游景点数据集）
"""
from django.db import models

from dvadmin.utils.models import table_prefix


class ScenicSpot(models.Model):
    """
    旅游景点表
    字段与《旅游景点数据集.xlsx》的 22 列一一对应
    """
    region_name = models.CharField(max_length=100, verbose_name="地区名称", db_index=True,
                                   help_text="景点所在地区，如：北京")
    region_en = models.CharField(max_length=100, verbose_name="地区英文", null=True, blank=True,
                                 help_text="地区英文名，如：beijing")
    name = models.CharField(max_length=255, verbose_name="景点名称", db_index=True, help_text="景点名称")
    district = models.CharField(max_length=255, verbose_name="区域", null=True, blank=True, help_text="所在区域")
    hot_score = models.FloatField(verbose_name="热度评分", null=True, blank=True, db_index=True,
                                  help_text="热度评分（0-10）")
    district_name = models.CharField(max_length=255, verbose_name="区域名称", null=True, blank=True,
                                     help_text="区域名称")
    ticket_price = models.FloatField(verbose_name="门票价格", null=True, blank=True, help_text="门票价格（元）")
    market_price = models.FloatField(verbose_name="市场价格", null=True, blank=True, help_text="市场价格（元）")
    market_discount_price = models.FloatField(verbose_name="市场折扣价格", null=True, blank=True,
                                              help_text="市场折扣价格（元）")
    min_discount_price = models.FloatField(verbose_name="下限折扣价格", null=True, blank=True,
                                           help_text="下限折扣价格（元）")
    min_price = models.FloatField(verbose_name="下限价格", null=True, blank=True, help_text="下限价格（元）")
    review_count = models.IntegerField(verbose_name="评论数量", null=True, blank=True, default=0,
                                       help_text="评论数量")
    review_score = models.FloatField(verbose_name="评论分", null=True, blank=True, help_text="评论分（0-5）")
    type_desc = models.CharField(max_length=50, verbose_name="类型描述", null=True, blank=True,
                                 help_text="类型描述，如：门票/免费")
    intro = models.TextField(verbose_name="简短介绍", null=True, blank=True, help_text="简短介绍（JSON数组字符串）")
    category = models.CharField(max_length=255, verbose_name="景点分类信息", null=True, blank=True,
                                help_text="景点分类信息")
    level = models.CharField(max_length=20, verbose_name="景区等级", null=True, blank=True, db_index=True,
                             help_text="景区等级，如：5A/4A")
    tags = models.TextField(verbose_name="标签", null=True, blank=True, help_text="标签（JSON数组字符串）")
    detail_url = models.CharField(max_length=500, verbose_name="景点详情页", null=True, blank=True,
                                  help_text="景点详情页链接")
    image_url = models.CharField(max_length=500, verbose_name="图片链接", null=True, blank=True, help_text="图片链接")
    image_url2 = models.CharField(max_length=500, verbose_name="图片链接2", null=True, blank=True,
                                  help_text="图片链接2")

    class Meta:
        db_table = table_prefix + "tourism_scenic"
        verbose_name = "旅游景点"
        verbose_name_plural = verbose_name
        ordering = ("-hot_score",)

    def __str__(self):
        return f"{self.region_name}-{self.name}"

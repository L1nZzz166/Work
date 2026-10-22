# -*- coding: utf-8 -*-
"""
@Remark: 导入旅游景点数据集（旅游景点数据集.xlsx）到 MySQL
用法：
    python manage.py import_scenic
    python manage.py import_scenic --file "E:/大数据/作业五/旅游景点数据集.xlsx"
    python manage.py import_scenic --truncate   # 清空后重新导入
"""
import os

import openpyxl
from django.core.management.base import BaseCommand

from application import settings
from tourism.models import ScenicSpot

# 默认数据集路径：backend 上级目录的上级目录（即项目作业目录）下的 旅游景点数据集.xlsx
DEFAULT_FILE = os.path.join(settings.BASE_DIR, "..", "..", "旅游景点数据集.xlsx")

# 数值字段（导入时做类型转换）
_INT_FIELDS = {"review_count"}
_FLOAT_FIELDS = {"hot_score", "ticket_price", "market_price", "market_discount_price",
                 "min_discount_price", "min_price", "review_score"}


def _convert(value, field_name):
    """把单元格值转换为目标字段类型，空值返回 None"""
    if value is None:
        return None
    if field_name in _INT_FIELDS:
        try:
            return int(float(str(value).strip()))
        except (ValueError, TypeError):
            return None
    if field_name in _FLOAT_FIELDS:
        try:
            return float(str(value).strip())
        except (ValueError, TypeError):
            return None
    if isinstance(value, float) and value.is_integer():
        # 字符串字段中出现的整数浮点，转成整数再转字符串，避免 "5.0"
        return str(int(value))
    return str(value).strip() if value is not None else None


class Command(BaseCommand):
    help = "导入旅游景点数据集到旅游景点表"

    def add_arguments(self, parser):
        parser.add_argument("--file", type=str, default=None, help="xlsx 文件路径")
        parser.add_argument("--truncate", action="store_true", help="清空表后重新导入")
        parser.add_argument("--batch", type=int, default=2000, help="每批写入条数")

    def handle(self, *args, **options):
        file_path = options["file"] or DEFAULT_FILE
        file_path = os.path.abspath(file_path)

        if not os.path.isfile(file_path):
            self.stderr.write(self.style.ERROR(f"文件不存在: {file_path}"))
            self.stderr.write("可用 --file 参数指定正确的 xlsx 路径")
            return

        existing = ScenicSpot.objects.count()
        if existing and not options["truncate"]:
            self.stdout.write(self.style.WARNING(
                f"表中已有 {existing} 条数据，跳过导入（如需重新导入请加 --truncate）"
            ))
            return

        if options["truncate"]:
            self.stdout.write("清空已有数据 ...")
            ScenicSpot.objects.all().delete()

        self.stdout.write(f"正在读取 {file_path} ...")
        wb = openpyxl.load_workbook(file_path, read_only=True)
        ws = wb.worksheets[0]

        rows = ws.iter_rows(values_only=True)
        header = next(rows)
        # 表头 -> 列索引
        col_index = {name: idx for idx, name in enumerate(header)}
        # 模型字段 -> 表头列名（跳过数据集自带的 ID 列）
        field_map = {
            "region_name": "地区名称",
            "region_en": "地区英文",
            "name": "景点名称",
            "district": "区域",
            "hot_score": "热度评分",
            "district_name": "区域名称",
            "ticket_price": "门票价格",
            "market_price": "市场价格",
            "market_discount_price": "市场折扣价格",
            "min_discount_price": "下限折扣价格",
            "min_price": "下限价格",
            "review_count": "评论数量",
            "review_score": "评论分",
            "type_desc": "类型描述",
            "intro": "简短介绍",
            "category": "景点分类信息",
            "level": "景区等级",
            "tags": "标签",
            "detail_url": "景点详情页",
            "image_url": "图片链接",
            "image_url2": "图片链接2",
        }

        batch_size = options["batch"]
        objects = []
        count = 0
        skipped = 0
        for row in rows:
            kwargs = {}
            for field_name, col_name in field_map.items():
                idx = col_index.get(col_name)
                value = row[idx] if idx is not None else None
                kwargs[field_name] = _convert(value, field_name)
            # 跳过景点名称为空的数据（数据集中的残缺记录）
            if not kwargs.get("name"):
                skipped += 1
                continue
            objects.append(ScenicSpot(**kwargs))
            count += 1
            if len(objects) >= batch_size:
                ScenicSpot.objects.bulk_create(objects)
                objects = []
                self.stdout.write(f"  已导入 {count} 条 ...")
        if objects:
            ScenicSpot.objects.bulk_create(objects)

        wb.close()
        self.stdout.write(self.style.SUCCESS(
            f"导入完成，共 {count} 条旅游景点数据（跳过 {skipped} 条名称为空的残缺记录）"
        ))

# -*- coding: utf-8 -*-
"""
@Remark: 修复菜单重复问题
问题：dvadmin3-celery 插件初始化时，会注册与框架内置 celery 菜单同 web_path/component_name
      （但 component 指向 plugins/dvadmin3-celery-web）的重复菜单，导致前端 vue-router
      路由 name/path 冲突，页面无法跳转。
用法：
    python manage.py fix_menu_duplicate
    python manage.py fix_menu_duplicate --list   仅列出重复，不删除
"""
from collections import defaultdict

from django.core.management.base import BaseCommand
from django.db.models import Count

from dvadmin.system.models import Menu


class Command(BaseCommand):
    help = "删除重复的菜单记录（修复前端路由冲突）"

    def add_arguments(self, parser):
        parser.add_argument("--list", action="store_true", help="仅列出重复菜单，不删除")

    def handle(self, *args, **options):
        only_list = options["list"]

        # 找出 web_path 重复的菜单
        duplicated_paths = (
            Menu.objects.exclude(web_path__isnull=True).exclude(web_path="")
            .values("web_path")
            .annotate(c=Count("id"))
            .filter(c__gt=1)
            .values_list("web_path", flat=True)
        )

        to_delete = []
        for path in duplicated_paths:
            group = list(Menu.objects.filter(web_path=path))
            # 保留 component 不以 plugins/ 开头的框架版菜单，删除 plugins 版
            keep = [m for m in group if not m.component.startswith("plugins/")]
            plugins = [m for m in group if m.component.startswith("plugins/")]
            if keep and plugins:
                to_delete.extend(plugins)
                for m in plugins:
                    self.stdout.write(
                        f"  [重复] id={m.id} name={m.name} path={m.web_path} component={m.component}"
                    )

        if not to_delete:
            self.stdout.write(self.style.SUCCESS("未发现重复菜单，无需修复"))
            return

        if only_list:
            self.stdout.write(self.style.WARNING(f"共发现 {len(to_delete)} 条重复菜单（未删除，--list 模式）"))
            return

        ids = [m.id for m in to_delete]
        Menu.objects.filter(id__in=ids).delete()
        self.stdout.write(self.style.SUCCESS(f"已删除 {len(to_delete)} 条重复菜单，前端刷新页面后即可恢复正常跳转"))

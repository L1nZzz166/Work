# -*- coding: utf-8 -*-
"""
@Remark: 旅游推荐模块初始化——菜单 + 按钮权限（随 `python manage.py init` 自动执行）
"""
from dvadmin.system.models import (
    Menu, MenuButton, Role, RoleMenuPermission, RoleMenuButtonPermission
)


class Initialize:
    """旅游推荐模块菜单与按钮权限初始化（幂等，可重复执行）"""

    def __init__(self, reset=False, app=None):
        self.reset = reset
        self.app = app or "tourism"

    def _menu(self, name, defaults):
        return Menu.objects.update_or_create(name=name, defaults=defaults)[0]

    def run(self):
        # 1. 一级目录：旅游推荐
        catalog = self._menu("旅游推荐", dict(
            icon="iconfont icon-lvyou",
            sort=90,
            is_catalog=True,
            is_link=False,
            web_path="/tourism",
            component="",
            component_name="tourism",
            status=True,
            cache=False,
            visible=True,
        ))
        # 2. 二级菜单：景点管理
        scenic_menu = self._menu("景点管理", dict(
            parent=catalog,
            icon="iconfont icon-jingdian",
            sort=1,
            is_catalog=False,
            is_link=False,
            web_path="/scenic",
            component="tourism/scenic/index",
            component_name="scenic",
            status=True,
            cache=False,
            visible=True,
        ))
        # 3. 二级菜单：旅游数据大屏
        board_menu = self._menu("旅游数据大屏", dict(
            parent=catalog,
            icon="iconfont icon-shujukanban",
            sort=2,
            is_catalog=False,
            is_link=False,
            web_path="/scenicBoard",
            component="tourism/recommend/index",
            component_name="scenicBoard",
            status=True,
            cache=False,
            visible=True,
        ))

        # 4. 按钮权限（value 唯一）
        buttons = [
            ("查询", "scenic:Search", "/api/tourism/scenic/", 0),
            ("新增", "scenic:Create", "/api/tourism/scenic/", 1),
            ("编辑", "scenic:Update", "/api/tourism/scenic/{id}/", 2),
            ("删除", "scenic:Delete", "/api/tourism/scenic/{id}/", 3),
            ("综合推荐", "scenic:Recommend", "/api/tourism/scenic/recommend/", 0),
            ("热门排行", "scenic:Top", "/api/tourism/scenic/top/", 0),
            ("相似推荐", "scenic:Similar", "/api/tourism/scenic/similar/", 0),
            ("统计聚合", "scenic:Stats", "/api/tourism/scenic/stats/", 0),
            ("地区列表", "scenic:Regions", "/api/tourism/scenic/regions/", 0),
        ]
        button_objs = []
        for name, value, api, method in buttons:
            btn, _ = MenuButton.objects.update_or_create(
                value=value,
                defaults=dict(menu=scenic_menu, name=name, api=api, method=method)
            )
            button_objs.append(btn)

        # 5. 授权给「管理员」角色
        admin_role = Role.objects.filter(key="admin").first() or Role.objects.filter(name="管理员").first()
        if admin_role:
            RoleMenuPermission.objects.get_or_create(role=admin_role, menu=catalog)
            RoleMenuPermission.objects.get_or_create(role=admin_role, menu=scenic_menu)
            RoleMenuPermission.objects.get_or_create(role=admin_role, menu=board_menu)
            for btn in button_objs:
                RoleMenuButtonPermission.objects.get_or_create(
                    role=admin_role, menu_button=btn, defaults=dict(data_range=3)
                )
        print("[tourism] 旅游推荐菜单与权限初始化完成")

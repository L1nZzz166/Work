# 旅游推荐后台管理系统

基于 **django-vue3-admin（dvadmin3）** 前后端分离框架，结合携程旅游景点数据集（48,127 条）搭建的旅游推荐后台管理系统。实现了旅游数据导入与管理、推荐功能接口、后台可视化大屏的完整流程。

## 目录结构

```
tourism-recommendation-system/
├── django-vue3-admin/                          # 项目代码（Django 后端 + Vue3 前端）
│   ├── backend/
│   │   ├── tourism/                            # ★ 自建模块：模型/序列化器/视图/导入命令/菜单初始化
│   │   ├── conf/env.example.py                 # 环境配置模板（复制为 env.py）
│   │   ├── application/                        # settings / urls
│   │   ├── dvadmin/                            # 核心框架
│   │   └── requirements.txt
│   └── web/
│       └── src/
│           ├── views/tourism/                  # ★ 景点管理 + 旅游数据大屏
│           └── router/                         # 路由（含 formatTwoStageRoutes 修复）
├── 旅游推荐后台管理系统-实训报告.md              # 实训报告（含完整踩坑记录）
├── django-vue3-admin 启动文档（本地版 STA.md    # 官方启动文档
└── 旅游景点数据集.xlsx                          # 数据源（48,354 行 × 22 列）
```

## 快速启动

- 后端：`cd backend && python -m venv venv && venv\Scripts\python.exe -m pip install -r requirements.txt && python manage.py makemigrations && python manage.py migrate && python manage.py init && python manage.py import_scenic && python manage.py runserver 0.0.0.0:8000`
- 前端：`cd web && npm install --legacy-peer-deps --registry=https://registry.npmmirror.com && npm install @vxe-ui/core dom-zindex --legacy-peer-deps && npm run dev`
- 登录：`superadmin / admin123456`

## 依赖版本（重要）

前端依赖需**锁定版本**，`npm install` 时 `^` 会误升级导致 bug：

| 包 | 版本 |
|---|---|
| @fast-crud/* | **1.21.2**（1.29.0 有 el-table 渲染 bug） |
| element-plus | 2.8.8 |
| vue | 3.4.38 |

详细踩坑记录见 `旅游推荐后台管理系统-实训报告.md` 第九章。

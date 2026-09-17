# 🏠 学生宿舍管理系统 — Django 项目全面解析

> 作者：林志杰 | 学号：29 | 技术栈：Python 3.7.8 + Django 2.2.0 + Bootstrap 4 + SQLite

---

## 一、项目概览

| 属性 | 详情 |
|------|------|
| **主题** | 学生宿舍管理系统 |
| **技术栈** | Python 3.7.8 + Django 2.2.0 + Bootstrap 4 + SQLite |
| **GitHub** | https://github.com/L1nZzz166/dormitory-management-system |
| **生产环境** | 腾讯云轻量服务器 + Nginx + Gunicorn（3 workers，监听 127.0.0.1:8001） |
| **部署方式** | `deploy.sh` 一键部署（支持 Ubuntu/CentOS/TencentOS） |
| **默认账号** | `24510206030229` / `123456` |
| **游客账号** | `guest` / `guest`（仅查看，不可增删改） |
| **中文支持** | `zh-hans` + `Asia/Shanghai` 时区 |

---

## 二、项目目录结构

```
dormitory_management/
├── manage.py                          # Django 管理入口
├── requirements.txt                   # 依赖（Django 2.2.0, gunicorn 等）
├── create_user.py                     # 创建默认账号脚本
├── seed_data.py                       # 初始化演示数据（7间宿舍 × 8名学生 × 5条报修）
├── deploy.sh                          # Linux 通用一键部署脚本
├── DEPLOY.md                          # 腾讯云部署完整教程
├── db.sqlite3                         # SQLite 数据库文件
├── .gitignore
│
├── dormitory_management/              # ★ Django 项目配置包
│   ├── settings.py                    # 项目配置（数据库/中间件/静态文件/语言/时区）
│   ├── urls.py                        # 根 URL 路由分发
│   └── wsgi.py                        # WSGI 入口
│
├── home/                              # ★【应用1：首页 / 登录认证】
│   ├── models.py                      # 无独立模型（使用 Django User 模型）
│   ├── views.py                       # 登录/退出/游客登录/首页视图
│   ├── urls.py                        # URL：login, guest-login, logout, index
│   └── templates/home/
│       ├── index.html                 # 首页（主题说明 + 三个子应用卡片入口）
│       └── login.html                 # 登录页面
│
├── student/                           # ★【应用2：学生管理】
│   ├── models.py                      # Student 模型（关联 Dormitory 外键）
│   ├── views.py                       # 列表/添加/编辑/删除 CRUD 视图
│   ├── forms.py                       # StudentForm（Django ModelForm）
│   ├── urls.py                        # URL：list, add, edit/<pk>, delete/<pk>
│   └── templates/student/
│       ├── list.html                  # 学生列表（表格展示）
│       ├── add.html                   # 添加学生表单
│       └── edit.html                  # 编辑学生表单
│
├── dormitory/                         # ★【应用3：宿舍管理】
│   ├── models.py                      # Dormitory 模型（楼栋/房间/容量等）
│   ├── views.py                       # 列表/添加/详情/删除视图
│   ├── forms.py                       # DormitoryForm
│   ├── urls.py                        # URL：list, add, detail/<pk>, delete/<pk>
│   └── templates/dormitory/
│       ├── list.html                  # 宿舍列表（带入住率统计）
│       ├── add.html                   # 添加宿舍表单
│       └── detail.html                # 宿舍详情 + 入住学生列表
│
├── repair/                            # ★【应用4：报修管理】
│   ├── models.py                      # Repair 模型（关联 Student + Dormitory）
│   ├── views.py                       # 列表/添加/详情/标记完成视图
│   ├── forms.py                       # RepairForm
│   ├── urls.py                        # URL：list, add, detail/<pk>, complete/<pk>
│   └── templates/repair/
│       ├── list.html                  # 报修列表（状态标签展示）
│       ├── add.html                   # 提交报修表单
│       └── detail.html                # 报修详情
│
├── templates/                         # 全局模板
│   ├── base.html                      # 主基础模板（导航栏+页脚）
│   └── base_login.html                # 登录页基础模板（无导航栏，纯白卡片）
│
└── static/css/
    └── style.css                      # 完整自定义样式（366行）
```

---

## 三、满足各项要求的逐条验证

### ✅ 要求1：至少 1 个首页 + 3 个子应用，共计 4 个以上页面

| 层级 | 应用 | 页面数 | 页面清单 |
|------|------|--------|----------|
| 首页 | `home` | **2 页** | `index.html`（首页）、`login.html`（登录页） |
| 子应用1 | `student` | **3 页** | `list.html`（学生列表）、`add.html`（添加学生）、`edit.html`（编辑学生） |
| 子应用2 | `dormitory` | **3 页** | `list.html`（宿舍列表）、`add.html`（添加宿舍）、`detail.html`（宿舍详情+入住学生） |
| 子应用3 | `repair` | **3 页** | `list.html`（报修列表）、`add.html`（提交报修）、`detail.html`（报修详情） |
| **合计** | **4 个应用** | **11 个页面** | ✅ 远超要求 |

### ✅ 要求2：各应用内容不重复 + 页面间可正常跳转

**内容独立性：**

- `home` — 系统登录认证 + 首页主题说明
- `student` — 学生信息 CRUD（姓名、学号、性别、电话、邮箱、入住日期、所属宿舍）
- `dormitory` — 宿舍楼栋房间管理（楼栋、房间号、楼层、容量、入住人数、房型、空余床位）
- `repair` — 设施报修管理（标题、描述、状态流转——待处理→处理中→已完成）

三个子应用各有独立的模型、视图、表单和模板，内容完全不重复。

**页面跳转连通性验证：**

```
登录页 ──登录成功──▶ 首页（index.html）
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
      学生列表 ◀──▶ 宿舍列表 ◀──▶ 报修列表
       │   │         │   │         │   │
       ▼   ▼         ▼   ▼         ▼   ▼
     添加 编辑     添加 详情     添加 详情
```

**跨应用跳转路径：**

| 起点 | 跳转方式 | 终点 |
|------|----------|------|
| 首页 | 点击功能卡片 | 学生列表 / 宿舍列表 / 报修列表 |
| 学生列表 | 点击宿舍名链接 | 宿舍详情页 |
| 宿舍详情 | 自动展示入住学生列表 | 学生信息一览 |
| 报修列表 | 点击宿舍名链接 | 宿舍详情页 |
| 报修详情 | 点击宿舍名链接 | 宿舍详情页 |
| 所有子页面 | "回到首页" 按钮 | 首页 |
| 所有页面 | 导航栏"退出"按钮 | 登录页 |

所有跳转均通过 Django 的 `{% url 'namespace:name' %}` 反向解析实现，零硬编码 URL。

### ✅ 要求3：首页模板详细分析

**`home/templates/home/index.html`（文件名必须为 `index.html`）✅：**

```html
{% extends 'base.html' %}  <!-- 继承基础模板，复用导航栏和页脚 -->

<!-- 1. Hero 欢迎区域 -->
<div class="hero-section">
    <h1>学生宿舍管理系统</h1>
    <p>高效、便捷的宿舍管理解决方案，让宿舍管理更轻松</p>
</div>

<!-- 2. 三个功能入口卡片，超链接到各子应用 -->
<a href="{% url 'student:list' %}" class="feature-card">
    👨‍🎓 学生管理 — 管理基本信息、入住登记、宿舍分配
</a>
<a href="{% url 'dormitory:list' %}" class="feature-card">
    🏠 宿舍管理 — 管理楼栋房间、入住情况、资源分配
</a>
<a href="{% url 'repair:list' %}" class="feature-card">
    🔧 报修管理 — 在线提交报修、实时跟踪维修进度
</a>

<!-- 3. 系统简介区域 -->
系统功能模块说明 + 技术栈介绍
```

首页清晰说明了主题（学生宿舍管理），正确超链接到三个子应用，使用了 Django 模板标签 `{% url %}` 和 `{% extends %}`。

---

## 四、数据库模型设计（SQLite）

### 跨应用模型关系图（ER 图）

```
┌───────────────────────┐
│      Dormitory        │
│───────────────────────│
│ PK  id                │
│     building (A/B/C/D)│◀──────────┐
│     room_number       │           │
│     floor             │           │  ForeignKey
│     capacity          │           │  (SET_NULL)
│     current_count     │           │
│     room_type         │           │
│     description       │           │
│                       │           │
│     available_beds    │  @property│
└──────────┬────────────┘           │
           │                        │
           │ ForeignKey             │
           │ (CASCADE)              │
           │                        │
           ▼                        │
┌───────────────────────┐           │
│       Student         │           │
│───────────────────────│           │
│ PK  id                │           │
│     name              │           │
│     student_id (UNIQUE)│          │
│     gender (男/女)     │           │
│     phone             │           │
│     email             │           │
│     check_in_date     │           │
│ FK  dormitory ────────┘           │
└──────────┬────────────────────────┘
           │
           │ ForeignKey (CASCADE)
           │
           ▼
┌───────────────────────┐
│       Repair          │
│───────────────────────│
│ PK  id                │
│     title             │
│     description       │
│     status (三态)      │
│ FK  student           │
│ FK  dormitory         │
│     create_time       │
│     complete_time     │
└───────────────────────┘
```

### 模型字段详情

**Dormitory（宿舍）模型** — `dormitory/models.py`：

| 字段 | 类型 | 说明 |
|------|------|------|
| `building` | CharField(choices) | A栋/B栋/C栋/D栋 |
| `room_number` | CharField | 房间号（如 101、302） |
| `floor` | IntegerField | 楼层 |
| `capacity` | IntegerField(default=4) | 总容量 |
| `current_count` | IntegerField(default=0) | 当前入住人数 |
| `room_type` | CharField(choices) | 4人间/6人间/8人间 |
| `description` | TextField(blank=True) | 宿舍描述 |
| `available_beds` | @property | 计算属性：capacity - current_count |

**Student（学生）模型** — `student/models.py`：

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | CharField(max_length=20) | 姓名 |
| `student_id` | CharField(max_length=20, unique=True) | 学号（唯一） |
| `gender` | CharField(choices=男/女) | 性别 |
| `phone` | CharField(max_length=15) | 联系电话 |
| `email` | EmailField(blank=True) | 电子邮箱 |
| `check_in_date` | DateField | 入住日期 |
| `dormitory` | ForeignKey(Dormitory, SET_NULL) | 所属宿舍（可为空） |

**Repair（报修）模型** — `repair/models.py`：

| 字段 | 类型 | 说明 |
|------|------|------|
| `title` | CharField(max_length=100) | 报修标题 |
| `description` | TextField | 问题描述 |
| `status` | CharField(choices) | pending/processing/completed |
| `student` | ForeignKey(Student, CASCADE) | 报修学生 |
| `dormitory` | ForeignKey(Dormitory, CASCADE) | 所在宿舍 |
| `create_time` | DateTimeField(auto_now_add) | 自动记录创建时间 |
| `complete_time` | DateTimeField(null=True) | 完成时间（可为空） |

### 种子数据（`seed_data.py`）

| 数据类型 | 数量 | 示例 |
|----------|------|------|
| 宿舍 | 7 间 | A101(4人间·阳面独卫)、B301(4人间·带阳台)、C502(8人间·超大空间) 等 |
| 学生 | 8 名 | 林志杰(学号29)、张伟、李娜、王强、赵敏、刘洋、陈雪、孙鹏 |
| 报修 | 5 条 | 水龙头漏水(待处理)、空调不制冷(处理中)、灯管闪烁(已完成) 等 |

种子数据脚本在创建学生后会自动更新对应宿舍的 `current_count` 字段。

---

## 五、视图层（Views）分析

### 认证系统（`home/views.py`）

| 视图函数 | URL | HTTP 方法 | 功能 | Django 知识点 |
|----------|-----|-----------|------|--------------|
| `user_login` | `/login/` | GET + POST | 登录验证，表单提交 | `authenticate()`, `login()`, `request.POST`, `redirect()` |
| `user_logout` | `/logout/` | GET | 退出登录 | `logout()`, `redirect()` |
| `guest_login` | `/guest-login/` | GET | 游客一键登录 | `User.objects.get()`, `login()` |
| `index` | `/` | GET | 首页展示 | `@login_required` 装饰器, `render()` |

**关键设计——游客模式：**

```python
def is_guest(user):
    """检查是否为游客"""
    return user.username == 'guest'
```

所有增删改操作都先调用 `is_guest(request.user)` 检查，游客只能查看不能操作，并通过 `django.contrib.messages` 弹出提示。

### 学生管理（`student/views.py`）—— 完整 CRUD

| 视图函数 | URL | 功能 |
|----------|-----|------|
| `student_list` | `/student/` | 查询所有学生 → 渲染表格 |
| `student_add` | `/student/add/` | GET 渲染空表单 / POST 验证保存 `ModelForm` |
| `student_edit` | `/student/edit/<int:pk>/` | GET 渲染带实例数据表单 / POST 更新 |
| `student_delete` | `/student/delete/<int:pk>/` | `get_object_or_404` → `delete()` → 重定向 |

### 宿舍管理（`dormitory/views.py`）—— 含跨应用查询

| 视图函数 | URL | 功能 |
|----------|-----|------|
| `dormitory_list` | `/dormitory/` | 查询所有宿舍 + 计算空余床位 |
| `dormitory_add` | `/dormitory/add/` | 添加宿舍 |
| `dormitory_detail` | `/dormitory/detail/<pk>/` | 宿舍详情 + **跨模型查询入住学生** `Student.objects.filter(dormitory=dormitory)` |
| `dormitory_delete` | `/dormitory/delete/<pk>/` | 删除宿舍 |

### 报修管理（`repair/views.py`）—— 含状态流转

| 视图函数 | URL | 功能 |
|----------|-----|------|
| `repair_list` | `/repair/` | 查询所有报修（按创建时间倒序） |
| `repair_add` | `/repair/add/` | 提交报修（选择学生和宿舍） |
| `repair_detail` | `/repair/detail/<pk>/` | 报修详情（含关联学生和宿舍信息） |
| `repair_complete` | `/repair/complete/<pk>/` | 状态流转：pending → completed + 记录完成时间 |

---

## 六、表单层（Forms）分析

三个子应用均使用 Django **ModelForm**，自动生成表单字段，并在 `Meta.widgets` 中为每个字段添加 Bootstrap 的 `form-control` CSS 类。

| 表单类 | 对应模型 | 字段数 | Widget 定制 |
|--------|----------|--------|-------------|
| `StudentForm` | Student | 7 | TextInput×4, Select×2, DateInput(type=date)×1 |
| `DormitoryForm` | Dormitory | 6 | Select×2, TextInput×1, NumberInput×2, Textarea×1 |
| `RepairForm` | Repair | 4 | TextInput×1, Textarea×1, Select×2 |

**核心代码模式（以 StudentForm 为例）：**

```python
class StudentForm(forms.ModelForm):
    class Meta:
        model = Student
        fields = ['name', 'student_id', 'gender', 'phone', 'email', 'check_in_date', 'dormitory']
        widgets = {
            'check_in_date': forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
            'name': forms.TextInput(attrs={'class': 'form-control'}),
            # ... 每个字段都指定了 Bootstrap 的 form-control 类
        }
        labels = {
            'name': '姓名',
            'student_id': '学号',
            # ... 所有 label 中文化
        }
```

---

## 七、模板层（Templates）分析

### 模板继承结构

```
base_login.html                         base.html
（登录页专用，无导航栏）                  （主模板：导航栏 + main-content弹性区 + 页脚）
        │                                      │
        │                    ┌─────────────────┼──────────────────┐
        │                    │                 │                  │
    login.html          index.html     student/list.html     repair/list.html
                                     student/add.html      repair/add.html
                                     student/edit.html     repair/detail.html
                                     dormitory/list.html
                                     dormitory/add.html
                                     dormitory/detail.html
```

### Django 模板标签/过滤器使用清单

| 标签/语法 | 用途 | 出现位置 |
|-----------|------|----------|
| `{% extends 'base.html' %}` | 模板继承 | 所有子页面 |
| `{% load static %}` | 加载静态文件标签库 | base.html, login.html |
| `{% static 'css/style.css' %}` | 静态文件路径引用 | base.html, login.html |
| `{% url 'namespace:name' %}` | 无参 URL 反向解析 | 导航栏、卡片链接、返回按钮 |
| `{% url 'namespace:name' obj.pk %}` | 带参 URL 反向解析 | 编辑/删除/详情链接 |
| `{% for item in queryset %}` | 循环遍历 QuerySet | 列表页数据行、表单字段遍历 |
| `{{ obj.field }}` | 模型字段输出 | 所有数据展示处 |
| `{{ obj.get_FOO_display }}` | choices 字段显示值 | 楼栋名(`get_building_display`)、房型显示 |
| `obj\|date:"Y-m-d"` | 日期格式化过滤器 | 入住日期 |
| `obj\|date:"Y-m-d H:i"` | 日期时间格式化 | 报修时间 |
| `obj.description\|linebreaks` | 将换行转为 `<br>`/`<p>` | 报修详情问题描述 |
| `{% if %}...{% elif %}...{% else %}...{% endif %}` | 条件判断 | 游客权限控制、空数据判断、状态标签切换 |
| `{% now "Y" %}` | 输出当前年份 | 页脚版权信息 |
| `{% csrf_token %}` | CSRF 防护令牌 | 所有 POST 表单 |
| `{{ request.resolver_match.app_name }}` | 获取当前应用名 | 导航栏 active 状态高亮 |
| `{{ user.username }}` | 当前登录用户名 | 导航栏用户信息显示 |
| `{{ messages }}` | Flash 消息遍历展示 | base.html 消息提示区域 |
| `{{ form.field }}` | 表单字段渲染（含 widget） | add.html, edit.html |

---

## 八、静态文件分析

**`static/css/style.css`（366行）** — 完整自定义样式表，与 Bootstrap 4 互补：

| 样式区域 | 关键设计 |
|----------|----------|
| **整体布局** | body 为 `flex` 纵向弹性盒，`.main-content` 的 `flex: 1` 自动撑满，确保页脚始终在底部 |
| **导航栏** | `linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%)` 蓝色渐变 + `box-shadow` + hover 半透明背景 |
| **Hero 欢迎区** | `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` 紫色渐变背景 + 白色文字 + 圆角 + 阴影 |
| **功能卡片** | 白色背景圆角 + hover 时 `translateY(-5px)` 上浮动效 + 阴影加深 |
| **表格容器** | `.table-container` 白色背景 + `border-radius: 10px` + `box-shadow` |
| **表格表头** | `background-color: #e8f0fe` 浅蓝 + `color: #1a73e8` 蓝色文字 |
| **表单卡片** | `.form-card` 最大宽度 700px 居中 + 白色圆角 + 阴影 |
| **状态标签** | 三色圆角药丸标签：`.badge-pending`(黄) / `.badge-processing`(蓝) / `.badge-completed`(绿) |
| **详情卡片** | `.detail-card` 中 dt 蓝色加粗 + dd 底部分隔线 |
| **页脚** | 同导航栏蓝色渐变 + 白色文字 + 作者姓名和学号信息 |
| **登录页** | `.login-page` 紫色渐变全屏背景 + `.login-card` 白色居中卡片 `box-shadow: 0 20px 50px rgba(0,0,0,0.3)` |
| **登录按钮** | 渐变背景 + hover 上浮 + 阴影加深过渡动画 |
| **响应式** | `@media (max-width: 768px)` 适配移动端 |
| **图标** | 通过 CDN 引入 Bootstrap Icons 1.7.2，全局使用 `bi bi-*` 类 |
| **返回链接** | `.back-link` 灰色文字 hover 变蓝过渡 |

---

## 九、URL 路由架构

```
dormitory_management/urls.py（根路由分发器）
│
├── admin/                          → Django 内置 admin 后台
│
├── /                               → home.urls  (namespace: home)
│   ├── login/                      → user_login（登录页面）
│   ├── guest-login/                → guest_login（游客一键登录）
│   ├── logout/                     → user_logout（退出登录）
│   └── /                           → index（首页，需登录 @login_required）
│
├── student/                        → student.urls  (namespace: student)
│   ├── /                           → student_list（学生列表）
│   ├── add/                        → student_add（添加学生）
│   ├── edit/<int:pk>/              → student_edit（编辑学生）
│   └── delete/<int:pk>/            → student_delete（删除学生）
│
├── dormitory/                      → dormitory.urls  (namespace: dormitory)
│   ├── /                           → dormitory_list（宿舍列表）
│   ├── add/                        → dormitory_add（添加宿舍）
│   ├── detail/<int:pk>/            → dormitory_detail（宿舍详情+入住学生）
│   └── delete/<int:pk>/            → dormitory_delete（删除宿舍）
│
└── repair/                         → repair.urls  (namespace: repair)
    ├── /                           → repair_list（报修列表）
    ├── add/                        → repair_add（提交报修）
    ├── detail/<int:pk>/            → repair_detail（报修详情）
    └── complete/<int:pk>/          → repair_complete（标记完成 + 状态流转）
```

**设计要点：**
- 每个应用通过 `app_name` 定义独立命名空间
- 全项目零硬编码 URL，使用 `{% url 'namespace:name' %}` 反向解析
- 编辑、详情、删除操作使用 `<int:pk>` 路径参数，配合 `get_object_or_404()` 实现安全的资源定位

---

## 十、settings.py 关键配置

| 配置项 | 值 | 意义 |
|--------|-----|------|
| `DEBUG` | `True` | 开发模式（生产部署时应设为 False） |
| `ALLOWED_HOSTS` | `['l1nz.xyz', 'www.l1nz.xyz', '127.0.0.1', 'localhost']` | 允许访问的域名/IP |
| `DATABASES` | SQLite3 (`db.sqlite3`) | 轻量级文件数据库，零配置 |
| `LANGUAGE_CODE` | `'zh-hans'` | 中文简体界面 |
| `TIME_ZONE` | `'Asia/Shanghai'` | 中国标准时间（UTC+8） |
| `STATIC_URL` | `'/static/'` | 静态文件 URL 前缀 |
| `STATICFILES_DIRS` | `[os.path.join(BASE_DIR, 'static')]` | 静态文件搜索目录 |
| `LOGIN_URL` | `'/login/'` | 未登录用户自动重定向到登录页 |
| `LOGIN_REDIRECT_URL` | `'/'` | 登录成功后跳转到首页 |
| `INSTALLED_APPS` | `home, student, dormitory, repair` + Django 内置 6 个 app | 所有应用已注册 |
| `TEMPLATES[].DIRS` | `[os.path.join(BASE_DIR, 'templates')]` | 全局模板目录 |
| `MIDDLEWARE` | 包含 Session/Auth/CSRF/Messages 等 | Django 标准中间件栈 |

---

## 十一、亮点总结

| # | 亮点 | 说明 |
|---|------|------|
| 1 | **游客模式** | 创新权限设计：游客只能查看，所有写操作被 `is_guest()` 拦截并弹出 messages 提示 |
| 2 | **跨应用数据关联** | Student → Dormitory 外键、Repair → Student + Dormitory 双外键，数据相互展示 |
| 3 | **模板继承体系** | `base_login.html`（登录专用，干净背景）和 `base.html`（主模板，含导航栏和页脚），消除代码重复 |
| 4 | **Bootstrap 4 + 自定义 CSS** | CDN 引入 Bootstrap 4.5.3 + Bootstrap Icons 1.7.2，自定义 366 行 `style.css` 提供完整品牌化视觉 |
| 5 | **ModelForm 表单** | 三个子应用均使用 Django ModelForm，自动验证 + Widget 定制 + 中文 label + 错误提示 |
| 6 | **messages 框架** | 游客操作被拦截时使用 `django.contrib.messages` 弹出警告提示 |
| 7 | **一键部署脚本** | `deploy.sh` 自动检测 Ubuntu/CentOS/TencentOS，安装 Python 3.7 → 配置 Nginx 反向代理 → Gunicorn → systemd 服务 |
| 8 | **种子数据脚本** | `seed_data.py` 自动创建 7 宿舍 + 8 学生 + 5 报修，并自动更新宿舍入住人数 |
| 9 | **CSS 细节打磨** | flex 弹性布局让页脚始终贴底、卡片 hover 上浮动效、渐变紫色登录背景、响应式断点适配 |
| 10 | **零硬编码 URL** | 全项目使用 `{% url %}` 反向解析和 `app_name` 命名空间，维护性极佳 |
| 11 | **安全防护** | 所有表单含 `{% csrf_token %}`、`@login_required` 保护所有功能页、`get_object_or_404()` 安全查询 |
| 12 | **完整部署文档** | `DEPLOY.md` 包含从购买服务器到上线的 6 步图文教程，附带故障排查指南 |

---

## 十二、运行方式

### 本地开发

```bash
# 1. 进入项目目录
cd dormitory_management

# 2. 创建虚拟环境（Python 3.7.8）
python -m venv venv
venv\Scripts\activate     # Windows
source venv/bin/activate  # Linux/Mac

# 3. 安装依赖
pip install django==2.2.0

# 4. 数据库迁移
python manage.py makemigrations
python manage.py migrate

# 5. 创建账号和种子数据
python create_user.py
python seed_data.py

# 6. 启动开发服务器
python manage.py runserver
```

### 浏览器访问

- 打开 http://127.0.0.1:8000
- 自动跳转到登录页 → 输入账号 `24510206030229` 密码 `123456`
- 或点击"游客登录"以只读模式浏览

---

> 📅 生成日期：2026-06-29 | 🛠 技术栈：Python 3.7.8 + Django 2.2.0 + Bootstrap 4 + SQLite

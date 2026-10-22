# django-vue3-admin 项目启动文档

> 基于 **Django-Vue-Admin（dvadmin3）** 开源框架的全栈后台管理系统。后端 Django 4.2 + DRF + JWT，前端 Vue3 + TypeScript + Vite + Element Plus + FastCrud，支持 RBAC 权限（细粒度到列）、动态菜单、WebSocket 消息等。

---

## 一、项目结构

```
django-vue3-admin-master/
├── backend/                     # Django 后端
│   ├── conf/env.example.py      # 环境配置模板（数据库/Redis/功能开关）
│   ├── application/             # 项目配置（settings / urls / asgi / wsgi / celery）
│   ├── dvadmin/                 # 核心框架（system 系统管理 / utils 工具）
│   ├── crud_demo/               # CRUD 示例模块
│   ├── plugins/                 # 插件目录
│   ├── static/ / templates/     # 静态资源与模板
│   ├── manage.py                # Django 管理入口
│   ├── main.py                  # uvicorn 启动入口（ASGI，端口 8000，4 workers）
│   └── requirements.txt         # Python 依赖（Django 4.2.7 等）
├── web/                         # Vue3 前端
│   ├── .env                     # 环境变量（端口 8080 / API 地址 VITE_API_URL）
│   ├── vite.config.ts           # Vite 配置
│   ├── package.json             # 前端依赖与脚本
│   └── src/                     # 源码（api / router / stores / views / layout）
├── docker-compose.yml           # Docker 编排（web / django / mysql / redis / celery）
├── docker_env/                  # Docker 构建文件与容器内配置
├── init.sh                      # 一键初始化脚本（生成密码→复制 env→docker compose 启动→迁移→初始化）
└── package.json                 # 根脚本（npm run dev 可并行启动前后端）
```

---

## 二、环境要求

| 组件 | 要求 | 说明 |
|---|---|---|
| Python | 3.7 ~ 3.12 | 后端运行环境 |
| Node.js | ≥ 16（推荐 18+） | 前端运行环境 |
| npm | ≥ 7 | 前端包管理 |
| MySQL | 8.0（推荐） | 数据库，默认配置库名 `django-vue3-admin`，账号 root / 密码 DVADMIN3（可改） |
| Redis | 可选 | 缓存/队列；本地开发不启动 Redis 也能运行（Channels 默认使用内存层） |
| Docker | 可选 | 方式一（容器化一键部署）需要 |

> 注意：`backend/conf/` 下只有 `env.example.py` 模板，**首次部署必须先复制为 `env.py`** 并按需修改，否则后端无法启动。

---

## 三、方式一：Docker Compose 一键部署（推荐）

### 1. 初始化（生成密码 + 复制 env + 启动容器 + 迁移 + 初始化）

```bash
# 在项目根目录执行（Linux/Mac）
bash init.sh
```

脚本自动完成：
1. 生成 `.env` 文件（MySQL / Redis 随机密码）
2. 复制 `backend/conf/env.example.py` → `backend/conf/env.py`，并把数据库/Redis 地址指向容器 IP（177.10.0.13 / 177.10.0.15）与随机密码
3. `docker-compose up -d` 启动 web / django / mysql / redis / celery 五个容器
4. 容器内依次执行 `makemigrations` → `migrate` → `init`（初始化菜单、角色、权限、超级管理员账号）

### 2. 访问系统

| 项目 | 地址 |
|---|---|
| 前端页面 | http://服务器IP:8080 |
| 后端 API | http://服务器IP:8000 |
| 数据库 | 127.0.0.1:3306（容器映射端口） |

**默认登录账号**：
- 账号：`superadmin`
- 密码：`admin123456`

### 3. 手动分步（等价于 init.sh，便于排错）

```bash
cp -i backend/conf/env.example.py backend/conf/env.py   # 首次复制
docker-compose up -d                                     # 启动全部容器
# 进入 django 容器执行初始化
docker exec dvadmin3-django python manage.py makemigrations
docker exec dvadmin3-django python manage.py migrate
docker exec dvadmin3-django python manage.py init
```

### 4. 常用 Docker 命令

```bash
docker-compose ps                # 查看容器状态
docker-compose logs -f dvadmin3-django   # 查看后端日志
docker-compose restart dvadmin3-django   # 重启后端
docker-compose down              # 停止全部容器（加 -v 同时删除数据卷）
```

---

## 四、方式二：本地手动部署（开发调试）

### 第 1 步：准备后端环境配置

```bash
cd backend
cp conf/env.example.py conf/env.py   # 复制配置模板
```

编辑 `conf/env.py`（按需修改）：

```python
# 使用 MySQL（默认）：
DATABASE_ENGINE = "django.db.backends.mysql"
DATABASE_NAME = 'django-vue3-admin'
DATABASE_HOST = '127.0.0.1'
DATABASE_PORT = 3306
DATABASE_USER = "root"
DATABASE_PASSWORD = 'DVADMIN3'      # 改为你自己的 MySQL 密码

# 或切换 SQLite（无需安装 MySQL，演示用）：
# DATABASE_ENGINE = "django.db.backends.sqlite3"
# DATABASE_NAME = os.path.join(BASE_DIR, "db.sqlite3")

# Redis（可选，本地无 Redis 可忽略）
REDIS_HOST = '127.0.0.1'
REDIS_PASSWORD = 'DVADMIN3'

# 功能开关
DEBUG = True
LOGIN_NO_CAPTCHA_AUTH = True        # True = 登录无需验证码，便于本地调试
```

> 使用 MySQL 前请先创建数据库：
> `CREATE DATABASE IF NOT EXISTS \`django-vue3-admin\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`

### 第 2 步：创建虚拟环境并安装依赖

```bash
# Windows（PowerShell 或 cmd）
python -m venv venv
venv\Scripts\activate           # PowerShell 报"禁止运行脚本"时改用 venv\Scripts\activate.bat
pip install -r requirements.txt

#   ⚠️ PowerShell 报"无法加载 Activate.ps1，禁止运行脚本"时，三种解决方式：
#   ① 不激活虚拟环境（最省事）：后续命令把 python 换成 venv\Scripts\python.exe
#      例如：venv\Scripts\python.exe -m pip install -r requirements.txt
#   ② 用 cmd 命令提示符：运行 venv\Scripts\activate.bat（.bat 不受执行策略限制）
#   ③ 放开执行策略后重新激活（提示时输入 Y 确认）：
#      Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
#      venv\Scripts\activate

# Linux / Mac
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

> ⚠️ Windows 安装 `mysqlclient` 失败时：到 [https://pypi.org/project/mysqlclient/](https://pypi.org/project/mysqlclient/) 下载对应 Python 版本的 `.whl` 文件，然后 `pip install <下载的whl文件>`。

### 第 3 步：迁移数据库并初始化

### MySQL新建数据库diango-vue3-admin

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py init          # 初始化菜单/角色/权限/超级管理员（必须执行）
```

### 第 4 步：启动后端

二选一：

```bash
# 方式 A：uvicorn ASGI 生产入口（端口 8000，含 WebSocket）
python main.py

# 方式 B：Django 开发服务器（热重载，调试推荐）
python manage.py runserver 0.0.0.0:8000
```

验证后端：浏览器访问 `http://127.0.0.1:8000/api/` 或登录接口 `POST http://127.0.0.1:8000/api/token/`。

### 第 5 步：启动前端

```bash
cd web
npm install

# 修改 API 地址（关键！默认指向线上环境，必须改为本地后端）
# 编辑 web/.env：
#   VITE_API_URL = 'http://127.0.0.1:8000'

npm run dev
```

- 前端地址：`http://127.0.0.1:8080`（端口在 `web/.env` 的 `VITE_PORT`，默认 8080）
- `npm run build` 可打包生产静态文件（输出到 `web/dist/`）

### 第 6 步：登录系统

打开 `http://127.0.0.1:8080`，输入：
- 账号：`superadmin`
- 密码：`admin123456`

登录后可见系统管理（用户/角色/菜单/部门/字典等）、CRUD 示例、数据大屏等模块，首次进入建议在"系统管理 → 用户"中修改密码。

---

## 五、初始化命令说明

| 命令 | 作用 |
|---|---|
| `python manage.py makemigrations` | 生成迁移文件（新装/模型变更后执行） |
| `python manage.py migrate` | 应用迁移，建表 |
| `python manage.py init` | **初始化基础数据**：菜单、按钮权限、角色、部门、字典、超级管理员（superadmin/admin123456）。每次重装数据库后必须执行 |
| `python manage.py init_area` | 初始化省市区数据（可选，数据量较大） |

---

## 六、前后端接口约定

- 前端所有请求通过 `web/src/utils/request.ts` 发出，基础地址读取环境变量 `VITE_API_URL`（`web/.env` 中配置）。
- 后端接口统一前缀 `/api/`，JWT 认证：请求头 `Authorization: Bearer <access_token>`。
- 登录接口：`POST /api/token/`（Body: `{username, password, captcha?}`，`LOGIN_NO_CAPTCHA_AUTH=True` 时无需验证码）。
- WebSocket：`ws://127.0.0.1:8000/ws/...`（Channels，本地使用内存通道层，无需 Redis）。

---

## 七、常见问题（FAQ）

**Q0：PowerShell 提示"无法加载 Activate.ps1，因为在此系统上禁止运行脚本"？**
Windows PowerShell 默认执行策略禁止运行 .ps1 脚本，三种解决方式：
- 不激活虚拟环境：后续命令直接用 `venv\Scripts\python.exe`，例如
  `venv\Scripts\python.exe manage.py runserver 0.0.0.0:8000`
- 使用 cmd 命令提示符：运行 `venv\Scripts\activate.bat`（.bat 文件不受执行策略限制）
- 放开当前用户执行策略后重新激活（提示时输入 Y 确认）：
  `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`，再执行 `venv\Scripts\activate`

**Q1：后端启动报 `ModuleNotFoundError: No module named 'conf.env'`？**
没有复制配置文件。执行 `cp backend/conf/env.example.py backend/conf/env.py`（Windows：`copy backend\conf\env.example.py backend\conf\env.py`）。

**Q2：连接 MySQL 失败 / Access denied？**
确认 `conf/env.py` 中 `DATABASE_HOST/PORT/USER/PASSWORD` 与本地 MySQL 一致；MySQL 8 请确认用户密码正确且库已创建。Docker 方式下密码由 `.env` 随机生成、自动写入 `env.py`，无需手动改。

**Q3：`mysqlclient` 安装失败（Windows）？**
下载对应 Python 版本的预编译 wheel 后 `pip install` 安装；或改用 SQLite（见第四节第 1 步）。

**Q4：前端页面能打开但接口 500 / 网络错误？**
检查 `web/.env` 的 `VITE_API_URL` 是否指向本地后端 `http://127.0.0.1:8000`（默认是线上演示域名，必须改），改后重启 `npm run dev`（`vite --force` 会重新加载环境变量）。

**Q5：8080 / 8000 / 3306 端口被占用？**
- 前端：修改 `web/.env` 的 `VITE_PORT`
- 后端：`python main.py` 的端口在 `backend/main.py`；`runserver` 直接跟端口参数
- MySQL：Docker 方式在 `docker-compose.yml` 的 `ports` 中修改映射

**Q6：登录提示"验证码错误"？**
本地调试将 `conf/env.py` 的 `LOGIN_NO_CAPTCHA_AUTH = True`（跳过验证码），或正确输入验证码（图片验证码接口为 `/api/captcha/`）。

**Q7：执行 `manage.py init` 报错？**
确认 `migrate` 已成功执行；init 依赖表结构存在。若重复执行提示数据冲突，可执行 `python manage.py init -y`（重置模式，谨慎使用）。

**Q8：安装依赖报 greenlet 编译失败（Microsoft Visual C++ 14.0 or greater is required）？**
原因：`gevent` 依赖 `greenlet`，Windows 上缺少 C++ 编译器时 pip 源码编译失败。两种解决方式：
- 先单独安装预编译 wheel 再装全部依赖（推荐）：
  `venv\Scripts\python.exe -m pip install greenlet==3.0.3 --only-binary :all:`
  `venv\Scripts\python.exe -m pip install -r requirements.txt`
- 本地开发可跳过 gevent/gunicorn：编辑 `backend/requirements.txt`，注释掉 `gevent==23.9.1`、`gunicorn==21.2.0`、`pyinstaller==6.8.0` 三行后再安装。本地用 `python manage.py runserver 0.0.0.0:8000` 启动即可，不影响开发。

**Q9：运行报 `ModuleNotFoundError: No module named 'pkg_resources'`？**
原因：新版 setuptools（≥81）已移除 `pkg_resources`，而 `drf_yasg` 等库仍依赖它。执行：
`venv\Scripts\python.exe -m pip install "setuptools<81"`
然后重新运行 `manage.py` 命令即可。

**Q10：运行报 `django.db.utils.OperationalError: (1049, "Unknown database 'django-vue3-admin'")`？**
原因：MySQL 中尚未创建 `conf/env.py` 里 `DATABASE_NAME` 指定的数据库。两种解决方式：
- 在 MySQL 中创建数据库（命令行 `mysql -u root -p` 进入后执行，或用 Navicat/Workbench 图形化创建）：
  `CREATE DATABASE IF NOT EXISTS \`django-vue3-admin\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
  然后重新执行 `python manage.py migrate`
- 不想装 MySQL：切换 SQLite，编辑 `conf/env.py`，注释 MySQL 三行配置并启用：
  `DATABASE_ENGINE = "django.db.backends.sqlite3"` / `DATABASE_NAME = os.path.join(BASE_DIR, "db.sqlite3")`

**Q11：运行报 `django.db.utils.ProgrammingError: (1146, "Table 'django-vue3-admin.dvadmin_system_users' doesn't exist")`？**
原因：数据库已建但业务表未创建，通常是跳过了 `migrate` 或执行顺序不对（`init`/`runserver` 跑在 `migrate` 之前）。按顺序依次执行：
`python manage.py makemigrations`
`python manage.py migrate`
`python manage.py init`
然后启动。若 `migrate` 显示 "No changes detected" 但仍缺表，执行 `python manage.py migrate --run-syncdb` 强制补建。切换过 SQLite/MySQL 后也必须重新 `migrate`（两边表互不相通）。

**Q12：访问 http://127.0.0.1:8000/api/ 显示 404（Page not found）？**
这是正常现象：本系统接口都挂在具体子路径下（`api/system/`、`api/token/`、`api/captcha/` 等），没有裸的 `/api/` 根路径。正确访问地址：
- 接口文档：`http://127.0.0.1:8000/swagger/`（Swagger，可在线调试）或 `备用文档：http://127.0.0.1:8000/redoc/`
- 登录接口：`http://127.0.0.1:8000/api/token/`
- 前端页面：`http://127.0.0.1:8080`

**Q13：前端报 `Could not resolve "@vxe-ui/core"` / `Could not resolve "dom-zindex"`？**
原因：`vxe-table` 依赖 `@vxe-ui/core` 与 `dom-zindex`，新版 npm（Node ≥ 20）安装时未自动补齐。在 `web/` 目录手动补装：
`npm install @vxe-ui/core dom-zindex`
然后重新 `npm run dev`。若提示其他 `Could not resolve "xxx"`，用同样方式补装对应包名。

---

## 八、技术栈清单

| 层 | 技术 |
|---|---|
| 后端框架 | Django 4.2.7 / Django REST Framework 3.14 |
| 认证 | SimpleJWT 5.3（多终端认证） |
| 实时通信 | Channels 3.0 + WebSocket（内存通道层，可切 Redis） |
| 数据库 | MySQL 8.0（默认）/ SQLite（可选） |
| 异步任务 | Celery + Redis（可选启用） |
| 前端框架 | Vue 3.2 + TypeScript 4.9 + Vite 4 |
| UI 组件 | Element Plus 2.5 + FastCrud 1.20（低代码 CRUD）+ TailwindCSS |
| 状态管理 | Pinia 2（持久化插件） |
| 其他 | ECharts（数据大屏）、wangEditor（富文本）、vxe-table、vue-i18n |

# 🏫 宿舍管理系统 — VS Code 手动增删改查教程（新手友好版）

> 本教程适合代码新手，手把手教你如何在 VS Code 里对数据进行**增、删、改、查**操作。

---

## 📋 目录

1. [前置准备](#1-前置准备)
2. [方法一：Django Admin 后台（最推荐新手 ⭐）](#2-方法一django-admin-后台)
3. [方法二：Django Shell 命令行（学习代码必会 ⭐⭐）](#3-方法二django-shell-命令行)
4. [方法三：写 Python 脚本（批量操作 ⭐⭐⭐）](#4-方法三写-python-脚本)
5. [VS Code 小技巧](#5-vs-code-小技巧)
6. [常用命令速查表](#6-常用命令速查表)

---

## 1. 前置准备

### 1.1 用 VS Code 打开项目

1. 打开 VS Code
2. 点击菜单 **文件 → 打开文件夹**
3. 选择 `E:\项目\dormitory_management` 文件夹
4. 点"打开"

### 1.2 打开 VS Code 终端

- 快捷键：**Ctrl + `**（键盘左上角 Esc 下方的那个键）
- 或者菜单：**终端 → 新建终端**

终端会在 VS Code 底部打开，你可以在里面输入命令。

### 1.3 确认 Python 环境

在终端中输入：

```bash
python --version
```

> 💡 在 Windows 上也可以试试 `py --version` 或 `python3 --version`，找到能用的命令后全程统一即可。

---

## 2. 方法一：Django Admin 后台

> 🎯 **最适合新手！** 图形化界面，点点鼠标就能完成所有操作，不需要写任何代码。

### 步骤 1：启动开发服务器

在 VS Code 终端中输入：

```bash
cd E:\项目\dormitory_management
python manage.py runserver
```

看到以下输出说明启动成功：

```
Starting development server at http://127.0.0.1:8000/
```

> 💡 服务器会一直运行，**不要关掉这个终端**。如果要停止，按 `Ctrl + C`。

### 步骤 2：打开后台管理页面

在浏览器中打开：

```
http://127.0.0.1:8000/admin/
```

### 步骤 3：登录

输入账号密码（在 `create_user.py` 中定义）：

| 用户名 | 密码 |
|--------|------|
| `24510206030229` | `123456` |

登录成功后，你会看到这个界面：

```
┌──────────────────────────────────┐
│  Django 管理                     │
├──────────────────────────────────┤
│  DORMITORY                       │
│  ✓ 宿舍     + 增加  + 修改       │
├──────────────────────────────────┤
│  REPAIR                          │
│  ✓ 报修     + 增加  + 修改       │
├──────────────────────────────────┤
│  STUDENT                         │
│  ✓ 学生     + 增加  + 修改       │
└──────────────────────────────────┘
```

### 🔍 查询数据

点击左侧的 **"宿舍"**、**"学生"** 或 **"报修"**，进入列表页面：

- **搜索**：顶部搜索框输入关键字（如学号、姓名、房间号）
- **筛选**：右侧边栏可以按楼栋、性别、状态等条件筛选
- **排序**：点击列标题可以按该列排序

### ➕ 新增数据

1. 点击右上角 **"增加 宿舍/学生/报修"** 按钮
2. 填写表单内容
3. 点击底部 **"保存"** 按钮

> 📝 例如新增一名学生：
> - 姓名：小明
> - 学号：2024001
> - 性别：男
> - 联系电话：13900001111
> - 入住日期：2026-07-01
> - 所属宿舍：选一个已有宿舍

### ✏️ 修改数据

1. 在列表页点击你要修改的那条记录
2. 修改对应字段
3. 点击 **"保存"**

### ❌ 删除数据

**删除单个**：
1. 点击进入某条记录
2. 底部点击红色 **"删除"** 按钮
3. 确认删除

**批量删除**：
1. 在列表页勾选多条记录（左侧复选框）
2. 顶部下拉选择 **"删除所选的对象"**
3. 点击 **"执行"**
4. 确认删除

---

## 3. 方法二：Django Shell 命令行

> 🎯 **学习代码必会！** 在终端里一行一行输入 Python 代码来操作数据库。

### 步骤 1：打开 Django Shell

在 VS Code 终端中输入（先确保 `runserver` 已停止，或打开一个新终端）：

```bash
cd E:\项目\dormitory_management
python manage.py shell
```

看到 `>>>` 提示符后，就可以输入 Python 代码了。

### 步骤 2：导入模型

首先导入数据模型（每次打开 Shell 都要先执行）：

```python
from dormitory.models import Dormitory
from student.models import Student
from repair.models import Repair
from datetime import date
```

---

### 🔍 查询（Read）

```python
# ===== 查看全部记录 =====
Dormitory.objects.all()        # 所有宿舍
Student.objects.all()          # 所有学生
Repair.objects.all()           # 所有报修

# ===== 条件查询 =====
# 查 A 栋的宿舍
Dormitory.objects.filter(building='A')

# 查学号为 '001' 的学生
Student.objects.filter(student_id='001')

# 查待处理的报修
Repair.objects.filter(status='pending')

# 查 4 人间的宿舍
Dormitory.objects.filter(room_type='4人间')

# ===== 获取单条记录 =====
stu = Student.objects.get(student_id='001')
print(stu.name)             # 输出：张伟
print(stu.phone)            # 输出：13800138001
print(stu.dormitory)        # 输出：A栋101

# ===== 获取第一条/最后一条 =====
Student.objects.first()      # 第一条学生记录
Student.objects.last()       # 最后一条学生记录

# ===== 查看数量 =====
Student.objects.count()      # 总共有多少学生
Dormitory.objects.filter(building='A').count()  # A栋有几间宿舍
```

---

### ➕ 新增（Create）

```python
# 方式一：create() 一步到位（推荐）
new_student = Student.objects.create(
    name='小明',
    student_id='2024001',
    gender='男',
    phone='13900001111',
    email='xiaoming@school.edu.cn',
    check_in_date=date(2026, 7, 1),
    dormitory=Dormitory.objects.first()   # 分到第一间宿舍
)
print('学生创建成功！')

# 方式二：先创建对象，再 save()
new_student = Student(
    name='小红',
    student_id='2024002',
    gender='女',
    phone='13900002222',
    check_in_date=date(2026, 7, 1),
    dormitory=Dormitory.objects.first()
)
new_student.save()
print('学生创建成功！')

# ===== 新增宿舍 =====
new_dorm = Dormitory.objects.create(
    building='D',
    room_number='601',
    floor=6,
    capacity=4,
    room_type='4人间',
    description='新装修的宿舍'
)

# ===== 新增报修 =====
new_repair = Repair.objects.create(
    title='网络故障',
    description='宿舍网络无法连接，网线插好但无信号。',
    student=Student.objects.get(student_id='001'),
    dormitory=Dormitory.objects.get(room_number='101', building='A')
)
```

> ⚠️ **注意**：新增学生后要同时更新宿舍的 `current_count`：
> ```python
> dorm = Dormitory.objects.get(room_number='101', building='A')
> dorm.current_count = Student.objects.filter(dormitory=dorm).count()
> dorm.save()
> ```

---

### ✏️ 修改（Update）

```python
# ===== 修改单条记录 =====
# 先查到要改的记录
stu = Student.objects.get(student_id='001')

# 修改字段
stu.phone = '13900009999'
stu.email = 'new_email@school.edu.cn'
stu.save()
print(f'{stu.name} 信息已更新！')

# ===== 批量修改（非常有用！）=====
# 把所有待处理报修改为处理中
Repair.objects.filter(status='pending').update(status='processing')

# 把 A 栋所有宿舍的描述更新
Dormitory.objects.filter(building='A').update(description='已消毒')

# 把某个学生转到另一个宿舍
stu = Student.objects.get(student_id='001')
stu.dormitory = Dormitory.objects.get(room_number='301', building='B')
stu.save()
```

---

### ❌ 删除（Delete）

```python
# ===== 删除单条记录 =====
stu = Student.objects.get(student_id='2024001')
stu.delete()
print('已删除！')

# ===== 批量删除 =====
# 删除所有已完成的报修
Repair.objects.filter(status='completed').delete()

# 删除某个学生没有宿舍的学生
Student.objects.filter(dormitory__isnull=True).delete()

# ⚠️ 危险操作：删除全部数据
# Student.objects.all().delete()   # 谨慎！这会删除所有学生
```

---

### 🚪 退出 Shell

```python
exit()
# 或者按 Ctrl + Z 然后回车
```

---

## 4. 方法三：写 Python 脚本

> 🎯 当你需要**重复执行**或**批量处理**数据时，写一个 `.py` 脚本最方便。

### 步骤 1：在 VS Code 中创建新文件

1. 左侧文件资源管理器右键 → **新建文件**
2. 命名为 `my_crud.py`
3. 写入以下内容：

```python
"""
我的数据操作脚本
直接在 VS Code 里按右上角 ▶ 运行按钮，或终端输入: python my_crud.py
"""
import os
import django
from datetime import date

# 这 3 行是固定的，告诉 Python 用哪个 Django 项目
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dormitory_management.settings')
django.setup()

# 导入数据模型
from dormitory.models import Dormitory
from student.models import Student
from repair.models import Repair


# ============ 🔍 查询演示 ============
print('=' * 50)
print('所有宿舍信息：')
print('=' * 50)
for dorm in Dormitory.objects.all():
    print(f'  {dorm} | {dorm.room_type} | {dorm.current_count}/{dorm.capacity}人 | {dorm.description}')

print()
print('=' * 50)
print('所有学生信息：')
print('=' * 50)
for stu in Student.objects.all():
    print(f'  {stu.student_id} {stu.name} {stu.gender} {stu.phone} → {stu.dormitory}')

print()
print('=' * 50)
print('待处理的报修：')
print('=' * 50)
for rep in Repair.objects.filter(status='pending'):
    print(f'  [{rep.status}] {rep.title} — {rep.student.name} ({rep.dormitory})')


# ============ ➕ 新增演示 ============
print()
print('=' * 50)
print('新增一名学生...')
print('=' * 50)

dorm = Dormitory.objects.first()
new_stu = Student.objects.create(
    name='测试学生',
    student_id='test999',
    gender='男',
    phone='13800000000',
    check_in_date=date.today(),
    dormitory=dorm
)
print(f'  ✅ 已创建: {new_stu}')

# 更新宿舍人数
dorm.current_count = Student.objects.filter(dormitory=dorm).count()
dorm.save()
print(f'  ✅ 宿舍 {dorm} 人数已更新为 {dorm.current_count}')


# ============ ✏️ 修改演示 ============
print()
print('=' * 50)
print('修改测试学生信息...')
print('=' * 50)

new_stu.phone = '13811111111'
new_stu.email = 'updated@school.edu.cn'
new_stu.save()
print(f'  ✅ 修改后: {new_stu.name} 电话={new_stu.phone} 邮箱={new_stu.email}')


# ============ ❌ 删除演示 ============
print()
print('=' * 50)
print('删除测试学生...')
print('=' * 50)

new_stu.delete()
# 再次更新宿舍人数
dorm.current_count = Student.objects.filter(dormitory=dorm).count()
dorm.save()
print(f'  ✅ 测试学生已删除，宿舍 {dorm} 当前人数={dorm.current_count}')


print()
print('=' * 50)
print('脚本执行完毕！')
print('=' * 50)
```

### 步骤 2：运行脚本

在 VS Code 终端中：

```bash
cd E:\项目\dormitory_management
python my_crud.py
```

你会看到脚本逐项执行查询、新增、修改、删除，并输出结果。

---

## 5. VS Code 小技巧

### 5.1 安装 Python 扩展（必装）

1. 点击左侧 **扩展** 图标（或按 `Ctrl + Shift + X`）
2. 搜索 **Python**
3. 安装 Microsoft 官方的 Python 扩展

安装后你会获得：
- 代码自动补全
- 错误提示
- 一键运行 Python 文件（右上角 ▶ 按钮）

### 5.2 分屏终端

当你需要**一边运行服务器、一边写 Shell** 时：

1. 点击终端右上角的 **+** 号 → 新建终端
2. 或者点击终端右上角的 **分屏** 图标

这样你可以：
- 左边终端跑 `python manage.py runserver`
- 右边终端跑 `python manage.py shell`

### 5.3 快速打开文件

- `Ctrl + P` → 输入文件名 → 回车

### 5.4 命令面板

- `Ctrl + Shift + P` → 输入命令 → 回车

例如输入 "Python: Run Python File in Terminal" 来运行当前文件。

### 5.5 多光标编辑

- `Alt + 点击` → 在多个位置同时打字

---

## 6. 常用命令速查表

### 项目启动

| 命令 | 说明 |
|------|------|
| `python manage.py runserver` | 启动开发服务器 |
| `python manage.py shell` | 打开 Django Shell |
| `python manage.py createsuperuser` | 创建管理员账号 |

### Shell 中 CRUD 速查

| 操作 | 代码 | 说明 |
|------|------|------|
| **查全部** | `Model.objects.all()` | 查询所有记录 |
| **条件查** | `Model.objects.filter(字段='值')` | 按条件查询 |
| **查单条** | `Model.objects.get(字段='值')` | 获取唯一一条（找不到会报错） |
| **查首个** | `Model.objects.first()` | 第一条记录 |
| **统计** | `Model.objects.count()` | 记录总数 |
| **新增** | `Model.objects.create(字段='值', ...)` | 一条命令创建并保存 |
| | `obj = Model(...); obj.save()` | 分两步创建保存 |
| **修改** | `obj.字段 = '新值'; obj.save()` | 修改单个对象 |
| | `Model.objects.filter(条件).update(字段='值')` | 批量修改 |
| **删除** | `obj.delete()` | 删除单个对象 |
| | `Model.objects.filter(条件).delete()` | 批量删除 |

### 本项目数据模型速查

#### Dormitory（宿舍）

| 字段 | 类型 | 说明 | 可选值 |
|------|------|------|--------|
| `building` | 字符串 | 楼栋 | A/B/C/D |
| `room_number` | 字符串 | 房间号 | 如 "101" |
| `floor` | 整数 | 楼层 | 1-6 |
| `capacity` | 整数 | 总容量 | 4/6/8 |
| `current_count` | 整数 | 当前人数 | 0-8 |
| `room_type` | 字符串 | 房型 | 4人间/6人间/8人间 |
| `description` | 文本 | 描述 | 任意文本 |

#### Student（学生）

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `name` | 字符串 | 姓名 | "张三" |
| `student_id` | 字符串(唯一) | 学号 | "2024001" |
| `gender` | 字符串 | 性别 | 男/女 |
| `phone` | 字符串 | 电话 | "13800138000" |
| `email` | 邮箱 | 邮箱 | "xx@school.edu.cn" |
| `check_in_date` | 日期 | 入住日期 | date(2026,7,1) |
| `dormitory` | 外键 | 所属宿舍 | Dormitory对象 |

#### Repair（报修）

| 字段 | 类型 | 说明 | 可选值 |
|------|------|------|--------|
| `title` | 字符串 | 标题 | "水龙头漏水" |
| `description` | 文本 | 问题描述 | 详细描述 |
| `status` | 字符串 | 状态 | pending/processing/completed |
| `student` | 外键 | 报修学生 | Student对象 |
| `dormitory` | 外键 | 所在宿舍 | Dormitory对象 |
| `create_time` | 时间 | 报修时间 | 自动生成 |
| `complete_time` | 时间 | 完成时间 | 可为空 |

---

## 🎯 学习路线建议

```
第 1 天：打开 Admin 后台，点点鼠标增删改查
         ↓
第 2 天：打开 Django Shell，逐行输入上面的查询命令
         ↓
第 3 天：在 Shell 里尝试新增、修改、删除
         ↓
第 4 天：把方法三的脚本复制到 my_crud.py 运行
         ↓
第 5 天：自己修改脚本，试试不同的查询条件
```

> 💡 **不要急于求成**，先玩熟 Admin 后台，再碰代码。遇到报错不要怕，把错误信息复制到 Google 搜索，这是每个程序员的日常。

---

📅 最后更新：2026-07-02
🐛 有问题？去 GitHub 提 Issue：[dormitory-management-system](https://github.com/L1nZzz166/dormitory-management-system)

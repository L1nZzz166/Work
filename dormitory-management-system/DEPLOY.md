# 🏠 学生宿舍管理系统 — 腾讯云部署完整教程

> 用 Python3.7 + Django2.2 + SQLite + Nginx 把你的网站发布到公网。  
> **Ubuntu / CentOS / TencentOS 全兼容，脚本自动判断系统。**

---

## 目录

- [你需要准备什么](#你需要准备什么)
- [第一步：购买服务器](#第一步购买服务器)
- [第二步：登录服务器](#第二步登录服务器)
- [第三步：开放 80 端口](#第三步开放-80-端口)
- [第四步：一键部署](#第四步一键部署)
- [第五步：验证上线](#第五步验证上线)
- [第六步：日常维护](#第六步日常维护)
- [故障排查](#故障排查)

---

## 你需要准备什么

| 东西 | 说明 |
|------|------|
| 腾讯云账号 | 去 [cloud.tencent.com](https://cloud.tencent.com) 注册，实名认证 |
| 充十几块钱 | 服务器最低 ¥28/月，学生认证更便宜 |
| 本教程 | 跟着做，不需要懂 Linux |

**不需要准备：**
- ❌ 不需要域名（有 IP 就够了）
- ❌ 不需要会 Linux（每条命令都解释了）
- ❌ 不需要安装任何工具（Windows 自带连接工具）

---

## 第一步：购买服务器

### 1.1 选哪种

腾讯云有两种服务器：

| 类型 | 价格 | 推荐 |
|------|------|------|
| **轻量应用服务器** | 便宜，界面简单 | ✅ 个人项目首选 |
| 云服务器 CVM | 功能多，配置复杂 | 企业用户 |

### 1.2 购买步骤

1. 打开 [腾讯云轻量服务器](https://buy.cloud.tencent.com/lighthouse)
2. 配置：

| 选项 | 选什么 |
|------|--------|
| 地域 | 离自己近的（广州、上海、北京随便） |
| 镜像 | **Ubuntu 22.04** 就行（CentOS 也支持，脚本自动处理） |
| 套餐 | 最低配 2核2G 完全够用 |
| 时长 | 先买 1 个月试试 |

3. 点击购买 → 支付

### 1.3 买完后

腾讯云控制台首页会显示你的服务器信息：

```
实例名称         状态      公网 IP          到期时间
xxxx-server      运行中    1.2.3.4          2026-07-22
```

**把你看到的公网 IP 记下来，后面每一步都要用。**

### 1.4 设置密码

1. 控制台 → 点击你的服务器名字进入详情
2. 在页面里找到「**设置密码**」或「**重置密码**」
3. 设置一个你能记住的密码（8 位以上，包含大小写和数字）

---

## 第二步：登录服务器

"登录服务器"就是从你自己的电脑远程连到这台云端机器。

根据你用的系统，选一种方式：

### 🪟 Windows

#### 方式一：PowerShell（推荐，Windows 自带）

1. 按键盘 `Win + R`
2. 输入 `powershell`
3. 回车 — 会弹出一个蓝色窗口
4. 在蓝色窗口里输入（把 `1.2.3.4` 换成你的公网 IP）：

```
ssh root@1.2.3.4
```

5. 第一次连接会提示：

```
The authenticity of host '1.2.3.4' can't be established.
Are you sure you want to continue connecting (yes/no)?
```

6. 输入 `yes` 回车

7. 输入你设置的密码，回车

> 输密码时屏幕上**什么都不会显示**，连 `***` 也没有。这是安全设计。输完直接回车就行。

8. 看到类似以下的文字就说明登录成功了：

```
Welcome to Ubuntu 22.04 LTS
root@VM-xxxx:~#
```

#### 方式二：腾讯云网页终端（如果 PowerShell 不行）

1. 控制台 → 轻量应用服务器 → 点击你的服务器
2. 页面右上角「**登录**」按钮
3. 选择「标准登录」→ 输入密码 → 确定
4. 浏览器里会出现一个黑色终端窗口，那就是你的服务器

> 网页终端不需要安装任何东西，但复制粘贴不太方便。推荐用 PowerShell。

### 🍎 Mac

1. 打开「**终端**」App（在启动台搜索 Terminal）
2. 输入 `ssh root@你的公网IP`
3. 第一次输入 `yes`
4. 输入密码
5. 看到 `root@...` 字样就登录成功了

---

## 第三步：开放 80 端口

> ⚠️ **非常重要！不做这一步，网站外网绝对打不开。**

云服务器的端口默认全关着，必须手动打开。

### 轻量应用服务器

1. 控制台 → 轻量应用服务器 → 点击你的服务器
2. 顶部找到「**防火墙**」标签，点击
3. 点击「**添加规则**」
4. 填：

| 字段 | 值 |
|------|-----|
| 应用类型 | HTTP (80) |
| 协议 | TCP |
| 端口 | 80 |
| 策略 | 允许 |

5. 确认列表里出现了 `TCP:80` 这一行

### 云服务器 CVM

1. 控制台 → 云服务器 → 点击你的实例
2. 找到「**安全组**」标签
3. 点击绑定的安全组名称（蓝色可点击）
4. 点击「**入站规则**」→「**添加规则**」：

| 字段 | 值 |
|------|-----|
| 类型 | HTTP(80) |
| 来源 | 0.0.0.0/0 |
| 协议端口 | TCP:80 |
| 策略 | 允许 |

---

## 第四步：一键部署

回到第二步登录服务器时那个**黑色命令行窗口**。

### 4.1 下载部署脚本

```bash
git clone https://github.com/L1nZzz166/dormitory-management-system.git
```

> 含义：从 GitHub 把项目代码下载到服务器。

**如果报 `git: command not found`：**

Ubuntu/Debian 系统：
```bash
apt-get update && apt-get install -y git
```

CentOS/TencentOS 系统：
```bash
yum install -y git
```

装完 Git 后重新执行上面的 `git clone` 命令。

**如果报 `Could not resolve host: github.com`：** 说明服务器连不上 GitHub，跳转到本文最后的「[服务器连不上 GitHub](#服务器连不上-github)」部分。

### 4.2 运行部署

```bash
cd dormitory-management-system
bash deploy.sh --ip 你的公网IP
```

示例（假设你的公网 IP 是 `1.2.3.4`）：
```bash
bash deploy.sh --ip 1.2.3.4
```

> 如果你有域名，可以写成 `bash deploy.sh --domain www.xxx.com`

### 4.3 等待完成

脚本自动执行，整个过程 **5~10 分钟**：

```
[INFO] 正在检测操作系统...
[INFO] 操作系统: ubuntu 22.04
[INFO] [1/7] 安装 Python 3.7...        ← 自动装 Python3.7 环境
[INFO] [2/7] 安装系统依赖...
[INFO] [3/7] 克隆项目代码...
[INFO] [4/7] 创建 Python 虚拟环境...
[INFO] [5/7] 初始化数据库...
      创建了 7 间宿舍
      创建了 8 名学生
      创建了 5 条报修记录
[INFO] [6/7] 配置 Nginx...
[INFO] [7/7] 创建 systemd 服务...

========================================
  ✅ 部署完成！
========================================
  网站: http://1.2.3.4
  Python: Python 3.7.17
  Django: 2.2.0
  账号: 24510206030229
  密码: 123456

  管理命令:
    sudo systemctl status dormitory
    sudo systemctl restart dormitory
    sudo journalctl -u dormitory -f
========================================
✅ dormitory 服务运行中
✅ nginx 服务运行中
```

看到「**✅ 部署完成！**」和两个「**运行中**」就说明一切 OK。

---

## 第五步：验证上线

### 5.1 打开网站

浏览器地址栏输入：

```
http://你的公网IP
```

### 5.2 确认以下功能都能正常使用

| 步骤 | 应该看到什么 |
|------|-------------|
| 打开网站 | 紫色渐变背景的登录页 |
| 登录 | 账号 `24510206030229` 密码 `123456` |
| 登录后 | 首页，顶部蓝色导航栏，中间三个功能卡片 |
| 学生管理 | 点进去有 8 个学生数据 |
| 宿舍管理 | 点进去有 7 间宿舍数据 |
| 报修管理 | 点进去有 5 条报修记录 |
| 页面底部 | 显示「林志杰」「学号：29」 |
| 退出 | 右上角退出按钮，退回到登录页 |

### 5.3 如果打不开？

跳到最后面的「[故障排查](#故障排查)」。

---

## 第六步：日常维护

### 更新代码

你在自己的电脑上改了代码，push 到 GitHub 后，想同步到服务器：

```bash
# SSH 登录
ssh root@你的公网IP

# 拉代码 + 重启
cd /opt/dormitory_management
git pull origin master
sudo systemctl restart dormitory
```

### 常用命令

```bash
# 看看服务是不是在跑
sudo systemctl status dormitory
# 按 q 退出

# 重启网站
sudo systemctl restart dormitory

# 查看运行日志
sudo journalctl -u dormitory -n 50

# 查看谁在访问
sudo tail -f /var/log/nginx/dormitory_access.log
```

---

## 故障排查

### 网站打不开 / 连接超时

1. **检查安全组**

   回腾讯云控制台 → 防火墙/安全组 → 确认 TCP:80 存在 → 没有就按第三步添加。

2. **检查 Nginx**

   ```bash
   sudo systemctl status nginx
   # 如果没跑：
   sudo systemctl start nginx
   ```

3. **CentOS 额外检查系统防火墙**

   ```bash
   sudo firewall-cmd --list-ports
   # 如果没有 80/tcp：
   sudo firewall-cmd --add-port=80/tcp --permanent
   sudo firewall-cmd --reload
   ```

### 打开后显示 502 Bad Gateway

Nginx 在运行，但是网站的后台进程挂了：

```bash
sudo systemctl restart dormitory
sleep 3
sudo systemctl status dormitory
# 应该显示 active (running)
```

### 打开后样式错乱、只有白底黑字

```bash
cd /opt/dormitory_management
source venv/bin/activate
python manage.py collectstatic --noinput
sudo systemctl restart nginx
```

然后浏览器按 `Ctrl + F5` 强刷。

### 服务器重启后网站打不开

```bash
sudo systemctl enable dormitory
sudo systemctl enable nginx
```

### 部署到一半报错 `apt-get: command not found`

说明你的系统不是 Ubuntu（可能是 CentOS 或 TencentOS）。

**更新后的脚本已自动处理。** 重新 clone 最新代码再跑一次：

```bash
rm -rf dormitory-management-system
git clone https://github.com/L1nZzz166/dormitory-management-system.git
cd dormitory-management-system
bash deploy.sh --ip 你的公网IP
```

### 部署时 Django 报错 `ModuleNotFoundError: No module named 'distutils'`

说明你的系统自带的 Python 太新（3.10+），Django 2.2 不支持。

**更新后的脚本已自动处理。** 脚本现在会自动检测 Python 版本，如果太新就自动安装 Python 3.7。重新 clone 最新代码再跑一次。

### 服务器连不上 GitHub

你电脑能上 GitHub 但是服务器不行，就**从你电脑把文件传上去**：

#### 在你自己的 Windows 电脑上

打开 PowerShell：

```bash
# 第一步：打包项目
cd E:/项目/dormitory_management
tar -czf dormitory.tar.gz --exclude=venv --exclude=db.sqlite3 --exclude=__pycache__ .

# 第二步：上传到服务器（把 IP 换成你自己的）
scp E:/项目/dormitory_management/dormitory.tar.gz root@你的公网IP:/opt/
```

#### 然后回到服务器

```bash
# 解压
cd /opt
mkdir -p dormitory_management
tar -xzf dormitory.tar.gz -C dormitory_management/
cd dormitory_management

# 然后重新运行部署脚本（它检测到代码已经有了，会跳过 clone 这一步）
bash deploy.sh --ip 你的公网IP
```

---

## 项目信息

| 项目 | 链接 |
|------|------|
| GitHub 仓库 | https://github.com/L1nZzz166/dormitory-management-system |
| 作者 | 林志杰 |
| 学号 | 29 |
| 技术栈 | Python 3.7 + Django 2.2 + Bootstrap 4 + SQLite |

---

> 🎉 完成全部步骤后，任何人都可以通过 `http://你的IP` 访问你的学生宿舍管理系统。

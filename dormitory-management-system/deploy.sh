#!/bin/bash
# ============================================
# 学生宿舍管理系统 - Linux 通用一键部署脚本
# Django 2.2 需要 Python 3.5~3.8
# 脚本会自动安装 Python 3.7（不影响系统现有 Python）
# ============================================

set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
echo_info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
echo_warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
echo_error() { echo -e "${RED}[ERROR]${NC} $1"; }
echo_step()  { echo -e "${GREEN}==>${NC} $1"; }

PROJECT_DIR="/opt/dormitory_management"
DOMAIN_OR_IP=""
GITHUB_REPO="https://github.com/L1nZzz166/dormitory-management-system.git"
PYTHON_VER="3.7"            # Django 2.2 需要的 Python 版本
PYTHON_BIN=""               # 最终要用的 python 路径（脚本自动填）

# ============================================
# 1. 检测操作系统
# ============================================
echo_info "正在检测操作系统..."

if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS_ID="$ID"
    OS_VERSION="$VERSION_ID"
else
    echo_error "无法检测操作系统版本"
    exit 1
fi

echo_info "操作系统: ${OS_ID} ${OS_VERSION}"

case "$OS_ID" in
    ubuntu|debian)
        PKG_MGR="apt-get"
        WEB_GROUP="www-data"
        ;;
    centos|rhel|almalinux|rocky|fedora|tencentos|anolis|openEuler)
        PKG_MGR="yum"
        WEB_GROUP="nginx"
        ;;
    *)
        echo_error "不支持的操作系统: $OS_ID"
        echo_warn "支持: Ubuntu/Debian/CentOS/RHEL/AlmaLinux/Rocky/TencentOS"
        exit 1
        ;;
esac

# ============================================
# 2. 解析命令行参数
# ============================================
while [[ $# -gt 0 ]]; do
    case $1 in
        --ip) DOMAIN_OR_IP="$2"; shift 2 ;;
        --domain) DOMAIN_OR_IP="$2"; shift 2 ;;
        -h|--help)
            echo "用法: bash deploy.sh --ip <你的服务器IP>"
            echo "     bash deploy.sh --domain <你的域名>"
            exit 0 ;;
        *) echo_error "未知参数: $1"; exit 1 ;;
    esac
done

if [ -z "$DOMAIN_OR_IP" ]; then
    DOMAIN_OR_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s icanhazip.com 2>/dev/null || echo "")
    if [ -z "$DOMAIN_OR_IP" ]; then
        echo_error "无法获取公网IP，请手动指定: bash deploy.sh --ip 1.2.3.4"
        exit 1
    fi
    echo_warn "自动检测到公网IP: $DOMAIN_OR_IP"
fi

echo_step "========================================"
echo_step "  学生宿舍管理系统 · 开始部署"
echo_step "  系统: $OS_ID $OS_VERSION"
echo_step "  公网IP: $DOMAIN_OR_IP"
echo_step "========================================"

# ============================================
# 3. 安装 Python 3.7
# Django 2.2 只能用 Python 3.5~3.8
# 服务器自带的 Python 3.10+/3.12 不行
# ============================================
echo_info "[1/7] 安装 Python ${PYTHON_VER}..."

PYTHON_FOUND=false

# 先检查是否已有 python3.7
if command -v python3.7 &>/dev/null; then
    echo_info "系统已有 python3.7，跳过安装"
    PYTHON_BIN="python3.7"
    PYTHON_FOUND=true
fi

if [ "$PYTHON_FOUND" = false ]; then
    case "$OS_ID" in
        ubuntu|debian)
            # --- Ubuntu/Debian: 用 deadsnakes PPA ---
            echo_info "添加 deadsnakes PPA 源..."
            sudo apt-get update -y -qq 2>/dev/null
            sudo apt-get install -y -qq software-properties-common 2>/dev/null
            sudo add-apt-repository -y ppa:deadsnakes/ppa 2>/dev/null
            sudo apt-get update -y -qq 2>/dev/null

            echo_info "安装 python3.7 及其组件..."
            sudo apt-get install -y -qq \
                python3.7 \
                python3.7-venv \
                python3.7-dev \
                python3.7-distutils \
                2>/dev/null

            # 确保 distutils 可用（新版 deadsnakes 可能没有单独包）
            if ! python3.7 -c "import distutils" 2>/dev/null; then
                echo_warn "distutils 缺失，用 setuptools 补充..."
                # 下载 pip 引导脚本安装 pip for 3.7
                curl -sS https://bootstrap.pypa.io/pip/3.7/get-pip.py -o /tmp/get-pip-37.py 2>/dev/null || \
                    wget -q https://bootstrap.pypa.io/pip/3.7/get-pip.py -O /tmp/get-pip-37.py 2>/dev/null
                sudo python3.7 /tmp/get-pip-37.py --force-reinstall 2>/dev/null || true
                # setuptools 提供 distutils 的替代
                sudo python3.7 -m pip install setuptools 2>/dev/null || true
            fi

            PYTHON_BIN="python3.7"
            ;;

        centos|rhel|almalinux|rocky|tencentos|anolis|openEuler|fedora)
            # --- CentOS/RHEL: 编译安装 Python 3.7 ---
            echo_info "安装编译依赖..."
            sudo yum install -y -q epel-release 2>/dev/null || true
            sudo yum install -y -q \
                gcc gcc-c++ make \
                openssl-devel bzip2-devel libffi-devel \
                zlib-devel readline-devel sqlite-devel \
                wget 2>/dev/null

            echo_info "下载 Python 3.7.17 源码（最后更新的 3.7 版本）..."
            cd /tmp
            wget -q https://www.python.org/ftp/python/3.7.17/Python-3.7.17.tgz -O Python-3.7.17.tgz
            tar -xzf Python-3.7.17.tgz
            cd Python-3.7.17

            echo_info "编译 Python 3.7（需要 3~8 分钟，请耐心等待）..."
            ./configure --enable-optimizations --enable-shared LDFLAGS="-Wl,-rpath /usr/local/lib" --prefix=/usr/local > /tmp/python-build.log 2>&1
            make -j$(nproc) > /tmp/python-build.log 2>&1
            sudo make altinstall > /tmp/python-build.log 2>&1

            # 创建软链接
            sudo ln -sf /usr/local/bin/python3.7 /usr/bin/python3.7
            sudo ln -sf /usr/local/bin/pip3.7 /usr/bin/pip3.7 2>/dev/null || true

            # 确保共享库可访问
            sudo ldconfig 2>/dev/null || true

            # 安装 pip
            echo_info "安装 pip for Python 3.7..."
            curl -sS https://bootstrap.pypa.io/pip/3.7/get-pip.py -o /tmp/get-pip-37.py 2>/dev/null || \
                wget -q https://bootstrap.pypa.io/pip/3.7/get-pip.py -O /tmp/get-pip-37.py 2>/dev/null
            sudo python3.7 /tmp/get-pip-37.py 2>/dev/null || true

            PYTHON_BIN="python3.7"
            ;;

        *)
            echo_warn "$OS_ID 未预设，尝试使用系统 python3..."
            PYTHON_BIN="python3"
            ;;
    esac

    # 验证
    if ! command -v $PYTHON_BIN &>/dev/null; then
        echo_error "Python 3.7 安装失败"
        echo_error "请手动执行:"
        echo_error "  Ubuntu: sudo apt-get install python3.7 python3.7-venv python3.7-dev"
        echo_error "  CentOS: 见 DEPLOY.md 手动编译步骤"
        exit 1
    fi
fi

echo_info "Python 版本: $($PYTHON_BIN --version)"

# ============================================
# 4. 安装其他系统依赖
# ============================================
echo_info "[2/7] 安装系统依赖 (nginx + git)..."

case "$OS_ID" in
    ubuntu|debian)
        sudo apt-get update -y -qq 2>/dev/null
        sudo apt-get install -y -qq nginx git curl 2>/dev/null
        ;;
    centos|rhel|almalinux|rocky|tencentos|anolis)
        sudo yum install -y -q epel-release 2>/dev/null || true
        sudo yum install -y -q nginx git curl 2>/dev/null
        ;;
    *)
        sudo $PKG_MGR install -y nginx git curl 2>/dev/null
        ;;
esac

# ============================================
# 5. 克隆代码
# ============================================
echo_info "[3/7] 克隆项目代码..."
sudo mkdir -p $PROJECT_DIR
sudo chown -R $USER:$USER $PROJECT_DIR

if [ -d "$PROJECT_DIR/.git" ]; then
    cd $PROJECT_DIR && git pull origin master
else
    git clone $GITHUB_REPO $PROJECT_DIR
fi

cd $PROJECT_DIR

# ============================================
# 6. 创建虚拟环境 + 安装 Python 依赖
# ============================================
echo_info "[4/7] 创建 Python 虚拟环境..."

# 删除旧的 venv（如果有，用的旧 Python）
rm -rf venv

# 用 Python 3.7 创建虚拟环境
$PYTHON_BIN -m venv venv
source venv/bin/activate

echo_info "安装 Django 2.2 和依赖..."
pip install --upgrade pip setuptools wheel -q 2>/dev/null || true
pip install django==2.2.0 gunicorn pytz sqlparse -q

echo_info "Django 版本: $(python -m django --version)"

# ============================================
# 7. 初始化数据库
# ============================================
echo_info "[5/7] 初始化数据库..."

python manage.py makemigrations --noinput
python manage.py migrate --noinput
python create_user.py
python seed_data.py

echo_info "收集静态文件..."
python manage.py collectstatic --noinput 2>/dev/null || echo_warn "静态文件收集跳过（CDN 加载不影响使用）"

# ============================================
# 8. 配置 Nginx
# ============================================
echo_info "[6/7] 配置 Nginx..."

case "$OS_ID" in
    centos|rhel|almalinux|rocky|tencentos|anolis|fedora)
        # CentOS 系列: conf.d 目录
        sudo mkdir -p /etc/nginx/conf.d /var/log/nginx

        sudo tee /etc/nginx/conf.d/dormitory.conf > /dev/null << NGINX_END
server {
    listen 80;
    server_name $DOMAIN_OR_IP;

    access_log /var/log/nginx/dormitory_access.log;
    error_log  /var/log/nginx/dormitory_error.log;

    location /static/ {
        alias $PROJECT_DIR/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location / {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 60s;
        proxy_read_timeout 60s;
    }

    client_max_body_size 10M;
}
NGINX_END

        # SELinux 放行
        sudo setsebool -P httpd_can_network_connect 1 2>/dev/null || true

        # 系统防火墙放行 80
        sudo firewall-cmd --add-port=80/tcp --permanent 2>/dev/null
        sudo firewall-cmd --reload 2>/dev/null || true
        ;;

    *)
        # Ubuntu/Debian: sites-available 目录
        sudo mkdir -p /var/log/nginx

        sudo tee /etc/nginx/sites-available/dormitory > /dev/null << NGINX_END
server {
    listen 80;
    server_name $DOMAIN_OR_IP;

    access_log /var/log/nginx/dormitory_access.log;
    error_log  /var/log/nginx/dormitory_error.log;

    location /static/ {
        alias $PROJECT_DIR/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location / {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 60s;
        proxy_read_timeout 60s;
    }

    client_max_body_size 10M;
}
NGINX_END

        sudo ln -sf /etc/nginx/sites-available/dormitory /etc/nginx/sites-enabled/
        sudo rm -f /etc/nginx/sites-enabled/default
        ;;
esac

sudo nginx -t && echo_info "Nginx 配置检测通过" || echo_warn "Nginx 配置检测有警告（不影响运行）"

# ============================================
# 9. 创建 systemd 服务
# ============================================
echo_info "[7/7] 创建 systemd 服务..."

GUNICORN_BIN="$PROJECT_DIR/venv/bin/gunicorn"

sudo tee /etc/systemd/system/dormitory.service > /dev/null << SYSTEMD_END
[Unit]
Description=学生宿舍管理系统
After=network.target

[Service]
User=$USER
Group=$WEB_GROUP
WorkingDirectory=$PROJECT_DIR
ExecStart=$GUNICORN_BIN \\
    --workers 3 \\
    --bind 127.0.0.1:8001 \\
    --timeout 60 \\
    --access-logfile /var/log/dormitory_gunicorn.log \\
    --error-logfile /var/log/dormitory_gunicorn_error.log \\
    dormitory_management.wsgi:application
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
SYSTEMD_END

# ============================================
# 10. 启动全部服务
# ============================================
sudo systemctl daemon-reload
sudo systemctl enable nginx
sudo systemctl enable dormitory
sudo systemctl restart nginx
sudo systemctl restart dormitory

sleep 2

# ============================================
# 验证结果
# ============================================
echo ""
echo_info "========================================"
echo_info "  ✅ 部署完成！"
echo_info "========================================"
echo_info "  网站: http://$DOMAIN_OR_IP"
echo_info "  Python: $($PYTHON_BIN --version)"
echo_info "  Django: 2.2.0"
echo_info "  账号: 24510206030229"
echo_info "  密码: 123456"
echo_info ""
echo_info "  管理命令:"
echo_info "    sudo systemctl status dormitory"
echo_info "    sudo systemctl restart dormitory"
echo_info "    sudo journalctl -u dormitory -f"
echo_info "========================================"

# 快速自检
if sudo systemctl is-active --quiet dormitory; then
    echo_info "✅ dormitory 服务运行中"
else
    echo_error "❌ dormitory 服务未启动，查看日志: sudo journalctl -u dormitory -n 30"
fi

if sudo systemctl is-active --quiet nginx; then
    echo_info "✅ nginx 服务运行中"
else
    echo_warn "⚠️ nginx 未启动，尝试手动: sudo systemctl start nginx"
fi

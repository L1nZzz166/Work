"""创建默认登录账号"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dormitory_management.settings')
django.setup()

from django.contrib.auth.models import User

username = '24510206030229'
password = '123456'

if User.objects.filter(username=username).exists():
    user = User.objects.get(username=username)
    user.set_password(password)
    user.save()
    print(f'用户 {username} 已存在，密码已更新。')
else:
    User.objects.create_user(username=username, password=password)
    print(f'用户 {username} 创建成功！')

# 创建游客账号
guest_username = 'guest'
guest_password = 'guest'
if User.objects.filter(username=guest_username).exists():
    user = User.objects.get(username=guest_username)
    user.set_password(guest_password)
    user.save()
    print(f'游客用户 {guest_username} 已存在，密码已更新。')
else:
    User.objects.create_user(username=guest_username, password=guest_password)
    print(f'游客用户 {guest_username} 创建成功！')

print(f'账号: {username}')
print(f'密码: {password}')

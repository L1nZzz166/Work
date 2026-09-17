"""种子数据脚本 - 用于初始化演示数据"""
import os
import django
from datetime import date

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dormitory_management.settings')
django.setup()

from dormitory.models import Dormitory
from student.models import Student
from repair.models import Repair

# 创建宿舍
dorms = [
    Dormitory(building='A', room_number='101', floor=1, capacity=4, current_count=0, room_type='4人间', description='阳面，独立卫浴'),
    Dormitory(building='A', room_number='102', floor=1, capacity=4, current_count=0, room_type='4人间', description='阳面，独立卫浴'),
    Dormitory(building='A', room_number='201', floor=2, capacity=6, current_count=0, room_type='6人间', description='靠近楼梯，公共卫浴'),
    Dormitory(building='B', room_number='301', floor=3, capacity=4, current_count=0, room_type='4人间', description='带阳台，独立卫浴'),
    Dormitory(building='B', room_number='302', floor=3, capacity=4, current_count=0, room_type='4人间', description='安静舒适，适合学习'),
    Dormitory(building='C', room_number='501', floor=5, capacity=6, current_count=0, room_type='6人间', description='高层视野好'),
    Dormitory(building='C', room_number='502', floor=5, capacity=8, current_count=0, room_type='8人间', description='超大空间'),
]

for d in dorms:
    d.save()
print(f'创建了 {len(dorms)} 间宿舍')

# 创建学生
students = [
    Student(name='林志杰', student_id='29', gender='男', phone='13800138029', email='zhijie@school.edu.cn',
            check_in_date=date(2025, 9, 1), dormitory=dorms[0]),
    Student(name='张伟', student_id='001', gender='男', phone='13800138001', email='zhangwei@school.edu.cn',
            check_in_date=date(2025, 9, 1), dormitory=dorms[0]),
    Student(name='李娜', student_id='002', gender='女', phone='13800138002', email='lina@school.edu.cn',
            check_in_date=date(2025, 9, 1), dormitory=dorms[1]),
    Student(name='王强', student_id='003', gender='男', phone='13800138003', email='wangqiang@school.edu.cn',
            check_in_date=date(2025, 9, 2), dormitory=dorms[1]),
    Student(name='赵敏', student_id='004', gender='女', phone='13800138004', email='zhaomin@school.edu.cn',
            check_in_date=date(2025, 9, 1), dormitory=dorms[2]),
    Student(name='刘洋', student_id='005', gender='男', phone='13800138005', email='liuyang@school.edu.cn',
            check_in_date=date(2025, 9, 3), dormitory=dorms[2]),
    Student(name='陈雪', student_id='006', gender='女', phone='13800138006', email='chenxue@school.edu.cn',
            check_in_date=date(2025, 9, 1), dormitory=dorms[3]),
    Student(name='孙鹏', student_id='007', gender='男', phone='13800138007', email='sunpeng@school.edu.cn',
            check_in_date=date(2025, 9, 2), dormitory=dorms[3]),
]

for s in students:
    s.save()
    # Update dormitory current_count
    dorm = s.dormitory
    if dorm:
        dorm.current_count = Student.objects.filter(dormitory=dorm).count()
        dorm.save()
print(f'创建了 {len(students)} 名学生')

# 创建报修记录
repairs = [
    Repair(title='水龙头漏水', description='卫生间水龙头关不紧，持续滴水，浪费水资源，请尽快维修。',
           status='pending', student=students[0], dormitory=dorms[0]),
    Repair(title='空调不制冷', description='宿舍空调打开后不制冷，夏天太热了，希望能尽快处理。',
           status='processing', student=students[1], dormitory=dorms[0]),
    Repair(title='灯管闪烁', description='房间主灯管频繁闪烁，影响夜间学习，请更换灯管。',
           status='completed', student=students[2], dormitory=dorms[1]),
    Repair(title='门锁损坏', description='宿舍门锁已损坏，无法正常上锁，存在安全隐患。',
           status='pending', student=students[4], dormitory=dorms[2]),
    Repair(title='床铺松动', description='上层床铺连接处松动，睡觉时有异响，需要加固。',
           status='pending', student=students[6], dormitory=dorms[3]),
]

for r in repairs:
    r.save()
print(f'创建了 {len(repairs)} 条报修记录')

print('\n种子数据创建完成！')

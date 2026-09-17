from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Dormitory
from .forms import DormitoryForm
from student.models import Student


def is_guest(user):
    """检查是否为游客"""
    return user.username == 'guest'


@login_required
def dormitory_list(request):
    """宿舍列表页面"""
    dormitories = Dormitory.objects.all()
    return render(request, 'dormitory/list.html', {'dormitories': dormitories})


@login_required
def dormitory_add(request):
    """添加宿舍"""
    if is_guest(request.user):
        messages.warning(request, '游客模式仅支持查看，无法添加数据')
        return redirect('dormitory:list')
    if request.method == 'POST':
        form = DormitoryForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('dormitory:list')
    else:
        form = DormitoryForm()
    return render(request, 'dormitory/add.html', {'form': form})


@login_required
def dormitory_detail(request, pk):
    """宿舍详情 - 显示该宿舍入住的学生"""
    dormitory = get_object_or_404(Dormitory, pk=pk)
    students = Student.objects.filter(dormitory=dormitory)
    return render(request, 'dormitory/detail.html', {
        'dormitory': dormitory,
        'students': students,
    })


@login_required
def dormitory_delete(request, pk):
    """删除宿舍"""
    if is_guest(request.user):
        messages.warning(request, '游客模式仅支持查看，无法删除数据')
        return redirect('dormitory:list')
    dormitory = get_object_or_404(Dormitory, pk=pk)
    dormitory.delete()
    return redirect('dormitory:list')

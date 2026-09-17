from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Student
from .forms import StudentForm


def is_guest(user):
    """检查是否为游客"""
    return user.username == 'guest'


@login_required
def student_list(request):
    """学生列表页面"""
    students = Student.objects.all()
    return render(request, 'student/list.html', {'students': students})


@login_required
def student_add(request):
    """添加学生"""
    if is_guest(request.user):
        messages.warning(request, '游客模式仅支持查看，无法添加数据')
        return redirect('student:list')
    if request.method == 'POST':
        form = StudentForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('student:list')
    else:
        form = StudentForm()
    return render(request, 'student/add.html', {'form': form})


@login_required
def student_edit(request, pk):
    """编辑学生信息"""
    if is_guest(request.user):
        messages.warning(request, '游客模式仅支持查看，无法编辑数据')
        return redirect('student:list')
    student = get_object_or_404(Student, pk=pk)
    if request.method == 'POST':
        form = StudentForm(request.POST, instance=student)
        if form.is_valid():
            form.save()
            return redirect('student:list')
    else:
        form = StudentForm(instance=student)
    return render(request, 'student/edit.html', {'form': form, 'student': student})


@login_required
def student_delete(request, pk):
    """删除学生"""
    if is_guest(request.user):
        messages.warning(request, '游客模式仅支持查看，无法删除数据')
        return redirect('student:list')
    student = get_object_or_404(Student, pk=pk)
    student.delete()
    return redirect('student:list')

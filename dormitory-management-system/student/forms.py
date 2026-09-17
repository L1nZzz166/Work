from django import forms
from .models import Student


class StudentForm(forms.ModelForm):
    class Meta:
        model = Student
        fields = ['name', 'student_id', 'gender', 'phone', 'email', 'check_in_date', 'dormitory']
        widgets = {
            'check_in_date': forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
            'name': forms.TextInput(attrs={'class': 'form-control'}),
            'student_id': forms.TextInput(attrs={'class': 'form-control'}),
            'gender': forms.Select(attrs={'class': 'form-control'}),
            'phone': forms.TextInput(attrs={'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'class': 'form-control'}),
            'dormitory': forms.Select(attrs={'class': 'form-control'}),
        }
        labels = {
            'name': '姓名',
            'student_id': '学号',
            'gender': '性别',
            'phone': '联系电话',
            'email': '电子邮箱',
            'check_in_date': '入住日期',
            'dormitory': '所属宿舍',
        }

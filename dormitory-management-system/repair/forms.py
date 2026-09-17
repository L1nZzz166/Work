from django import forms
from .models import Repair


class RepairForm(forms.ModelForm):
    class Meta:
        model = Repair
        fields = ['title', 'description', 'student', 'dormitory']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 4}),
            'student': forms.Select(attrs={'class': 'form-control'}),
            'dormitory': forms.Select(attrs={'class': 'form-control'}),
        }
        labels = {
            'title': '报修标题',
            'description': '问题描述',
            'student': '报修学生',
            'dormitory': '所在宿舍',
        }

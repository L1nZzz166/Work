from django import forms
from .models import Dormitory


class DormitoryForm(forms.ModelForm):
    class Meta:
        model = Dormitory
        fields = ['building', 'room_number', 'floor', 'capacity', 'room_type', 'description']
        widgets = {
            'building': forms.Select(attrs={'class': 'form-control'}),
            'room_number': forms.TextInput(attrs={'class': 'form-control'}),
            'floor': forms.NumberInput(attrs={'class': 'form-control'}),
            'capacity': forms.NumberInput(attrs={'class': 'form-control'}),
            'room_type': forms.Select(attrs={'class': 'form-control'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
        }
        labels = {
            'building': '楼栋',
            'room_number': '房间号',
            'floor': '楼层',
            'capacity': '总容量',
            'room_type': '房型',
            'description': '宿舍描述',
        }

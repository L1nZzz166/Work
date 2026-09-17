from django.db import models


class Student(models.Model):
    """学生模型"""
    GENDER_CHOICES = [
        ('男', '男'),
        ('女', '女'),
    ]

    name = models.CharField(max_length=20, verbose_name='姓名')
    student_id = models.CharField(max_length=20, unique=True, verbose_name='学号')
    gender = models.CharField(max_length=2, choices=GENDER_CHOICES, verbose_name='性别')
    phone = models.CharField(max_length=15, verbose_name='联系电话')
    email = models.EmailField(blank=True, default='', verbose_name='电子邮箱')
    check_in_date = models.DateField(verbose_name='入住日期')
    dormitory = models.ForeignKey(
        'dormitory.Dormitory',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name='所属宿舍'
    )

    class Meta:
        verbose_name = '学生'
        verbose_name_plural = '学生'
        ordering = ['student_id']

    def __str__(self):
        return f'{self.name} ({self.student_id})'

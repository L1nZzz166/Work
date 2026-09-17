from django.db import models


class Repair(models.Model):
    """报修模型"""
    STATUS_CHOICES = [
        ('pending', '待处理'),
        ('processing', '处理中'),
        ('completed', '已完成'),
    ]

    title = models.CharField(max_length=100, verbose_name='报修标题')
    description = models.TextField(verbose_name='问题描述')
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name='处理状态'
    )
    student = models.ForeignKey(
        'student.Student',
        on_delete=models.CASCADE,
        verbose_name='报修学生'
    )
    dormitory = models.ForeignKey(
        'dormitory.Dormitory',
        on_delete=models.CASCADE,
        verbose_name='所在宿舍'
    )
    create_time = models.DateTimeField(auto_now_add=True, verbose_name='报修时间')
    complete_time = models.DateTimeField(null=True, blank=True, verbose_name='完成时间')

    class Meta:
        verbose_name = '报修'
        verbose_name_plural = '报修'
        ordering = ['-create_time']

    def __str__(self):
        return self.title

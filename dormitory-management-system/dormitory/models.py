from django.db import models


class Dormitory(models.Model):
    """宿舍模型"""
    BUILDING_CHOICES = [
        ('A', 'A栋'),
        ('B', 'B栋'),
        ('C', 'C栋'),
        ('D', 'D栋'),
    ]
    ROOM_TYPE_CHOICES = [
        ('4人间', '4人间'),
        ('6人间', '6人间'),
        ('8人间', '8人间'),
    ]

    building = models.CharField(max_length=10, choices=BUILDING_CHOICES, verbose_name='楼栋')
    room_number = models.CharField(max_length=10, verbose_name='房间号')
    floor = models.IntegerField(verbose_name='楼层')
    capacity = models.IntegerField(default=4, verbose_name='总容量')
    current_count = models.IntegerField(default=0, verbose_name='当前人数')
    room_type = models.CharField(max_length=10, choices=ROOM_TYPE_CHOICES, default='4人间', verbose_name='房型')
    description = models.TextField(blank=True, default='', verbose_name='宿舍描述')

    class Meta:
        verbose_name = '宿舍'
        verbose_name_plural = '宿舍'
        ordering = ['building', 'room_number']

    def __str__(self):
        return f'{self.get_building_display()}{self.room_number}'

    @property
    def available_beds(self):
        return self.capacity - self.current_count

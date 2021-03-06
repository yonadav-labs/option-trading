from django.db import models

from .base import BaseModel


class MarketDate(BaseModel):
    TYPE_CHOICES = (
        ('holiday', 'Holiday'),
    )
    date = models.DateField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='holiday')

    class Meta:
        unique_together = ('date', 'type')

from django.db import models

from .base import BaseModel
from .user import User


class Blog(BaseModel):
    title = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)
    slide_link = models.URLField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="blogs")

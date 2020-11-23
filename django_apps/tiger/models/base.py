from django.db import models


class BaseModel(models.Model):
    created_time = models.DateTimeField(auto_now_add=True)
    last_updated_time = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True  # specify this model as an Abstract Model
        app_label = 'tiger'

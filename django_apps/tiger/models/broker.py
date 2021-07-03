from django.core.validators import MinValueValidator
from django.db import models

from .base import BaseModel


class Broker(BaseModel):
    name = models.CharField(max_length=200)
    options_open_commission = models.FloatField(default=0, validators=[MinValueValidator(0)])
    options_close_commission = models.FloatField(default=0, validators=[MinValueValidator(0)])
    stock_commission = models.FloatField(default=0, validators=[MinValueValidator(0)])
    # default brokers would be used for customers without any broker set.
    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

    def get_broker_settings(self):
        broker_settings = {
            'open_commission': self.options_open_commission,
            'close_commission': self.options_close_commission,
        }

        return broker_settings

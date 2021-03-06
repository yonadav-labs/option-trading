# Generated by Django 3.1.2 on 2020-12-17 00:56

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('tiger', '0011_subscription'),
    ]

    operations = [
        migrations.AddField(
            model_name='subscription',
            name='last_checked',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='subscription',
            name='status',
            field=models.CharField(default='', max_length=200, verbose_name='Subscription status'),
        ),
        migrations.AlterField(
            model_name='subscription',
            name='paypal_subscription_id',
            field=models.CharField(max_length=200, unique=True),
        ),
        migrations.AlterField(
            model_name='subscription',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='subscriptions', to=settings.AUTH_USER_MODEL),
        ),
    ]

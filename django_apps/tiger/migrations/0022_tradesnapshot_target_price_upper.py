# Generated by Django 3.1.2 on 2021-01-16 21:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tiger', '0021_auto_20210116_1629'),
    ]

    operations = [
        migrations.AddField(
            model_name='tradesnapshot',
            name='target_price_upper',
            field=models.FloatField(blank=True, null=True),
        ),
    ]

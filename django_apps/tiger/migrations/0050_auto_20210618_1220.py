# Generated by Django 3.1.12 on 2021-06-18 16:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tiger', '0049_backfill_data_time'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='tickerstats',
            name='company_name',
        ),
        migrations.AlterField(
            model_name='tickerstats',
            name='data_time',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]

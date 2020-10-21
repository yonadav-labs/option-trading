# Generated by Django 3.1.2 on 2020-10-20 05:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('option', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Ticker',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_time', models.DateTimeField(auto_now_add=True)),
                ('last_updated_time', models.DateTimeField(auto_now=True)),
                ('symbol', models.CharField(blank=True, max_length=20, null=True)),
                ('full_name', models.CharField(blank=True, max_length=200, null=True)),
            ],
            options={
                'abstract': False,
            },
        ),
    ]

# Generated by Django 3.1.2 on 2021-01-16 21:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tiger', '0020_tradesnapshot_target_price'),
    ]

    operations = [
        migrations.RenameField(
            model_name='tradesnapshot',
            old_name='target_price',
            new_name='target_price_lower',
        ),
        migrations.AlterField(
            model_name='tradesnapshot',
            name='type',
            field=models.CharField(choices=[('unspecified', 'Unspecified'), ('long_call', 'Long call'), ('covered_call', 'Covered call'), ('long_put', 'Long put'), ('cash_secured_put', 'Cash secured put'), ('bull_call_spread', 'Bull call spread')], default='unspecified', max_length=100),
        ),
    ]
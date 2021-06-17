# Manual 2021-06-14

import django.contrib.postgres.fields
from django.db import migrations, models
from tiger.models import TickerStats

    
class Migration(migrations.Migration):

    dependencies = [
        ('tiger', '0048_tickerstats_data_time'),
    ]

    data_time_sql = """
    UPDATE
        tiger_tickerstats ts
    SET
        data_time = created_time
    """
    operations = [
        migrations.RunSQL(data_time_sql)
    ]

# Generated by Django 5.1 on 2024-09-05 12:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('events', '0007_team_last_modified_date_team_team_leader_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='team',
            name='name',
            field=models.CharField(max_length=255, unique=True),
        ),
    ]
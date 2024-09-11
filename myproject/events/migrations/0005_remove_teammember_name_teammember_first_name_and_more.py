# Generated by Django 5.1 on 2024-09-03 01:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('events', '0004_activity_event_activities_volunteerpoints_activity'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='teammember',
            name='name',
        ),
        migrations.AddField(
            model_name='teammember',
            name='first_name',
            field=models.CharField(default='DEFAULT VALUE', max_length=100),
        ),
        migrations.AddField(
            model_name='teammember',
            name='last_name',
            field=models.CharField(default='DEFAULT VALUE', max_length=100),
        ),
        migrations.AlterField(
            model_name='teammember',
            name='membership_category',
            field=models.CharField(max_length=50),
        ),
    ]
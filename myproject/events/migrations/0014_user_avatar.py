# Generated by Django 5.1 on 2024-09-30 03:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('events', '0013_alter_volunteerpoints_hours_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='avatar',
            field=models.ImageField(blank=True, null=True, upload_to='avatars/'),
        ),
    ]

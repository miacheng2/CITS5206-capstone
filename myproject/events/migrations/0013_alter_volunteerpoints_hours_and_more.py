# Generated by Django 5.1 on 2024-09-29 09:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('events', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='volunteerpoints',
            name='hours',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='volunteerpoints',
            name='points',
            field=models.FloatField(),
        ),
    ]
# Generated by Django 5.1 on 2024-09-03 03:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('events', '0005_remove_teammember_name_teammember_first_name_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='teammember',
            name='mobile',
            field=models.IntegerField(null=True),
        ),
    ]
# Generated by Django 5.1 on 2024-09-05 09:46

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('events', '0006_teammember_mobile'),
    ]

    operations = [
        migrations.AddField(
            model_name='team',
            name='last_modified_date',
            field=models.DateField(auto_now=True),
        ),
        migrations.AddField(
            model_name='team',
            name='team_leader',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='team',
            name='description',
            field=models.TextField(default='No description available'),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='team',
            name='name',
            field=models.CharField(max_length=255),
        ),
    ]

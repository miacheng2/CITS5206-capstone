from django.db import models

# Create your models here.
class VolunteerTeam(models.Model):
    team_name = models.CharField(max_length=255, unique=True)

class Member(models.Model):
    australian_sailing_number = models.CharField(max_length=10, unique=True)
    first_name = models.CharField(max_length=100, blank=True, null=True)
    last_name = models.CharField(max_length=100, blank=True, null=True)
    mobile = models.CharField(max_length=20, blank=True, null=True)
    email_address = models.EmailField(max_length=255, blank=True, null=True)
    payment_status = models.CharField(max_length=100)
    volunteer_levy = models.CharField(max_length=50, blank=True, null=True, choices=[
        ('I will volunteer', 'I will volunteer'),
        ('I will pay the levy', 'I will pay the levy'),
        ('', 'Blank')
    ])
    volunteer_teams = models.ManyToManyField(VolunteerTeam, blank=True)

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
from django.db import models

class Member(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    points = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    def __str__(self):
        return self.name

class Event(models.Model):
    title = models.CharField(max_length=255)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    points_awarded = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    def __str__(self):
        return self.title

class VolunteerLog(models.Model):
    member = models.ForeignKey(Member, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    hours_worked = models.DecimalField(max_digits=4, decimal_places=2)
    points_earned = models.DecimalField(max_digits=5, decimal_places=2)

    def __str__(self):
        return f'{self.member.name} - {self.event.title}'


# Create your models here.

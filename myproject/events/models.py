from django.db import models

class TeamMember(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    membership_category = models.CharField(max_length=50)

class Event(models.Model):
    EVENT_TYPE_CHOICES = (
        ('on_water', 'On-Water'),
        ('off_water', 'Off-Water'),
    )
    name = models.CharField(max_length=100)
    event_type = models.CharField(max_length=10, choices=EVENT_TYPE_CHOICES)
    date = models.DateField()

class VolunteerPoints(models.Model):
    member = models.ForeignKey(TeamMember, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    points = models.IntegerField()
    hours = models.IntegerField(null=True, blank=True)  # Only for off-water events

    def save(self, *args, **kwargs):
        if self.event.event_type == 'off_water' and self.hours:
            self.points = self.hours * 10  # Example: 10 points per hour
        elif self.event.event_type == 'on_water':
            # Custom logic for on-water events
            self.points = 20  # Example: Fixed points
        super().save(*args, **kwargs)

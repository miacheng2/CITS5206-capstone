from django.db import models

class TeamMember(models.Model):
    SENIOR_SAILING = 'Senior sailing membership'
    SENIOR_CREW = 'Senior crew membership'
    JUNIOR_SAILING = 'Junior sailing membership'
    FAMILY = 'Family membership'
    NON_SAILING = 'Non sailing membership'
    PROVISIONAL = 'Provisional Membership'
    PENSIONER_STUDENT = 'Pensioner/Student'
    
    MEMBERSHIP_CATEGORY_CHOICES = [
        (SENIOR_SAILING, 'Senior sailing membership – A senior sailor is any member over the age of 18 with full member privileges'),
        (SENIOR_CREW, 'Senior crew membership – A senior crew is any member over the age of 18 but does not own a boat within the club'),
        (JUNIOR_SAILING, 'Junior sailing membership – Any sailing member under the age of 18'),
        (FAMILY, 'Family membership – This membership is for families consisting of two adult members over the age of 18 with dependents under the age of 18'),
        (NON_SAILING, 'Non sailing membership – for members that want to be part of the club that do not sail a boat'),
        (PROVISIONAL, 'Provisional Membership – A person who is a full member of a kindred water sports club'),
        (PENSIONER_STUDENT, 'Pensioner/Student – (see concession information below)'),
    ]
    
    name = models.CharField(max_length=100)
    email = models.EmailField()
    membership_category = models.CharField(max_length=50, choices=MEMBERSHIP_CATEGORY_CHOICES)

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

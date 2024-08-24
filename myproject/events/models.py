from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager

class UserManager(BaseUserManager):
    def create_user(self, email, username, user_type, password=None):
        if not email:
            raise ValueError('Users must have an email address')
        user = self.model(
            email=self.normalize_email(email),
            username=username,
            user_type=user_type,
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, user_type='admin', password=None):
        user = self.create_user(
            email=email,
            username=username,
            user_type=user_type,
            password=password,
        )
        user.is_admin = True
        user.save(using=self._db)
        return user

class User(AbstractBaseUser):
    ADMIN = 'admin'
    TEAM_LEADER = 'team_leader'
    USER_TYPE_CHOICES = [
        (ADMIN, 'Admin'),
        (TEAM_LEADER, 'Team Leader'),
    ]
    
    email = models.EmailField(primary_key=True, unique=True)
    username = models.CharField(max_length=50)
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES)
    
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'user_type']
    
    def __str__(self):
        return self.email
    
    def has_perm(self, perm, obj=None):
        return True
    
    def has_module_perms(self, app_label):
        return True
    
    @property
    def is_staff(self):
        return self.is_admin

class Team(models.Model):
    name = models.CharField(max_length=100)
    
    def __str__(self):
        return self.name

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
    teams = models.ManyToManyField(Team, related_name='members', blank=True)

class Event(models.Model):
    EVENT_TYPE_CHOICES = (
        ('on_water', 'On-Water'),
        ('off_water', 'Off-Water'),
    )
    name = models.CharField(max_length=100)
    event_type = models.CharField(max_length=10, choices=EVENT_TYPE_CHOICES)
    date = models.DateField()
    # allow null for now, will change it later
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)

class VolunteerPoints(models.Model):
    member = models.ForeignKey(TeamMember, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    points = models.IntegerField()
    hours = models.IntegerField(null=True, blank=True)  # Only for off-water events
    # allow null for now, will change it later
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)

    def save(self, *args, **kwargs):
        if self.event.event_type == 'off_water' and self.hours:
            self.points = self.hours * 10  # Example: 10 points per hour
        elif self.event.event_type == 'on_water':
            # Custom logic for on-water events
            self.points = 20  # Example: Fixed points
        super().save(*args, **kwargs)

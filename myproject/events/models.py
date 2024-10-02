# models.py
import math
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager

class UserManager(BaseUserManager):
    def create_user(self, username, email, user_type, password=None):
        if not username:
            raise ValueError('Users must have a username')
        if not email:
            raise ValueError('Users must have an email address')
        user = self.model(
            username=username,
            email=self.normalize_email(email),
            user_type=user_type,
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, user_type='admin', password=None):
        user = self.create_user(
            username=username,
            email=email,
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
    
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=50, unique=True)  
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)  # New field for avatar

    
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'username' 
    REQUIRED_FIELDS = ['email', 'user_type']

    def __str__(self):
        return self.username
    
    def has_perm(self, perm, obj=None):
        return True
    
    def has_module_perms(self, app_label):
        return True
    
    @property
    def is_staff(self):
        return self.is_admin

class Team(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    creation_date = models.DateField(auto_now_add=True)
    last_modified_date = models.DateField(auto_now=True)
    team_leader = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)


    def __str__(self):
        return self.name
class TeamMember(models.Model):
    I_WILL_VOLUNTEER = 'I will volunteer'
    I_WILL_PAY_LEVY = 'I will pay the levy'
    
    VOLUNTEER_OR_LEVY_CHOICES = [
        (I_WILL_VOLUNTEER, 'I will volunteer'),
        (I_WILL_PAY_LEVY, 'I will pay the levy'),
    ]

    australian_sailing_number = models.IntegerField(primary_key=True)
    first_name = models.CharField(max_length=100,default='DEFAULT VALUE')
    last_name = models.CharField(max_length=100,default='DEFAULT VALUE')
    mobile = models.IntegerField(null=True)
    email = models.EmailField()
    membership_category = models.CharField(max_length=50)
    will_volunteer_or_pay_levy = models.CharField(
        max_length=50, 
        choices=VOLUNTEER_OR_LEVY_CHOICES, 
        blank=True,
        null=True,
    )
    teams = models.ManyToManyField(Team, related_name='members', blank=True)

    @property
    def name(self):
        return f"{self.first_name} {self.last_name}"
    
    def __str__(self):
        return f"{self.name} - {self.australian_sailing_number}"

class Activity(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Event(models.Model):
    EVENT_TYPE_CHOICES = (
        ('on_water', 'On-Water'),
        ('off_water', 'Off-Water'),
    )
    name = models.CharField(max_length=100)
    event_type = models.CharField(max_length=10, choices=EVENT_TYPE_CHOICES)
    date = models.DateField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    activities = models.ManyToManyField(Activity, related_name='events', blank=True)

    def __str__(self):
        return self.name
    
class VolunteerPoints(models.Model):
    member = models.ForeignKey(TeamMember, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    points = models.FloatField()  # Allow decimal points for finer calculations
    hours = models.FloatField(null=True, blank=True)  
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    activity = models.ForeignKey(Activity, on_delete=models.SET_NULL, null=True, blank=True)

    def save(self, *args, **kwargs):
        if self.event.event_type == 'off_water' and self.hours:
            self.points = (20 / 3) * self.hours
        elif self.event.event_type == 'on_water':
            # Custom logic for on-water events
            self.points = 20  # Fixed points for on-water events
            self.hours = 3  # Set hours to three for on-water events
        super().save(*args, **kwargs)
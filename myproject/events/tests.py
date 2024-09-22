from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from events.models import User  # Use custom User model
from .models import User, Team, TeamMember, Activity, Event, VolunteerPoints


class UserRegistrationTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.registration_url = '/api/register/'

    def test_user_registration(self):
        data = {
            'username': 'testuser',
            'password': 'testpassword123',
            'email': 'testuser@example.com',
            'user_type': 'team_leader'  # Include the required user_type field
        }
        response = self.client.post(self.registration_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)  # Check if JWT access token is returned
        self.assertIn('refresh', response.data)  # Check if JWT refresh token is returned


class UserLoginTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.login_url = '/api/login/'
        # Create a valid user for testing
        self.user = User.objects.create_user(
            username='testuser',
            password='testpassword123',
            email='testuser@example.com',
            user_type='team_leader'
        )

    def test_invalid_user_login(self):
        # Attempt to login with an incorrect password
        data = {'username': 'testuser', 'password': 'wrongpassword'}
        response = self.client.post(self.login_url, data, format='json')
        
        # Expecting 401 Unauthorized for invalid credentials
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('detail', response.data)  # Check for error message in the response

class UserModelTest(TestCase):
    def setUp(self):
        # Create a user to test with
        self.user = User.objects.create_user(
            username='testuser',
            email='testuser@example.com',
            user_type=User.ADMIN,
            password='password123'
        )
    
    def test_user_creation(self):
        self.assertEqual(self.user.username, 'testuser')
        self.assertEqual(self.user.email, 'testuser@example.com')
        self.assertTrue(self.user.check_password('password123'))
        self.assertFalse(self.user.is_admin)  # is_admin should be False by default

    def test_create_superuser(self):
        admin_user = User.objects.create_superuser(
            username='adminuser',
            email='admin@example.com',
            password='adminpass'
        )
        self.assertTrue(admin_user.is_admin)
    
    def test_string_representation(self):
        self.assertEqual(str(self.user), 'testuser')


class TeamModelTest(TestCase):
    def setUp(self):
        # Create a user to assign as team leader
        self.team_leader = User.objects.create_user(
            username='leader',
            email='leader@example.com',
            user_type=User.TEAM_LEADER,
            password='leaderpass'
        )
        # Create a team
        self.team = Team.objects.create(
            name='Test Team',
            description='A description of the test team',
            team_leader=self.team_leader
        )
    
    def test_team_creation(self):
        self.assertEqual(self.team.name, 'Test Team')
        self.assertEqual(self.team.description, 'A description of the test team')
        self.assertEqual(self.team.team_leader, self.team_leader)


class VolunteerPointsModelTest(TestCase):
    def setUp(self):
        # Create necessary objects
        self.user = User.objects.create_user(
            username='testuser',
            email='testuser@example.com',
            user_type=User.ADMIN,
            password='password123'
        )
        self.team_member = TeamMember.objects.create(
            australian_sailing_number=12345,
            first_name='John',
            last_name='Doe',
            email='johndoe@example.com',
            membership_category='regular'
        )
        self.activity = Activity.objects.create(name='Sailing')
        self.on_water_event = Event.objects.create(
            name='On-Water Event',
            event_type='on_water',
            date='2024-01-01',
            created_by=self.user
        )
        self.off_water_event = Event.objects.create(
            name='Off-Water Event',
            event_type='off_water',
            date='2024-01-01',
            created_by=self.user
        )
    
    def test_volunteer_points_on_water_event(self):
        points = VolunteerPoints.objects.create(
            member=self.team_member,
            event=self.on_water_event,
            activity=self.activity,
            created_by=self.user
        )
        self.assertEqual(points.points, 20)
        self.assertEqual(points.hours, 0)  # hours should be 0 for on-water event
    
    def test_volunteer_points_off_water_event(self):
        points = VolunteerPoints.objects.create(
            member=self.team_member,
            event=self.off_water_event,
            activity=self.activity,
            hours=6,  # 6 hours
            created_by=self.user
        )
        self.assertEqual(points.points, 40)  # 6 hours * (20/3) = 40 points

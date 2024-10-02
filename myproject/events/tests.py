from django.test import TestCase
from rest_framework.test import APIClient, APITestCase
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.urls import reverse
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

    def test_valid_user_login(self):
        # Attempt to login with correct credentials
        data = {'username': 'testuser', 'password': 'testpassword123'}
        response = self.client.post(self.login_url, data, format='json')
        
        # Expecting 200 OK for valid credentials
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)  # Check for 'access' token in the response
        self.assertIn('refresh', response.data)  # Check for 'refresh' token in the response
        self.assertIn('user_role', response.data)

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
            username='testadminuser',
            email='testadmin@example.com',
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
        self.assertEqual(points.hours, 3)  
    
    def test_volunteer_points_off_water_event(self):
        points = VolunteerPoints.objects.create(
            member=self.team_member,
            event=self.off_water_event,
            activity=self.activity,
            hours=6,  # 6 hours
            created_by=self.user
        )
        self.assertEqual(points.points, 40)  # 6 hours * (20/3) = 40 points

# test apis
# test event view set
class EventViewSetTests(APITestCase):
    def setUp(self):
        self.login_url = '/api/login/'
        # Create a test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword',
            user_type='admin'
        )
        
        # Log in and get token
        data = {'username': 'testuser', 'password': 'testpassword'}
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Get token from the response
        token = response.data['access']  # JWT token
        
        # Set the authorization header with the token
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)  # Use Bearer token for JWT

        # Create an activity for testing
        self.activity = Activity.objects.create(name='Test Activity')

        # Create an event for testing
        self.event_data = {
            'name': 'Test Event',
            'event_type': 'off_water',
            'date': '2024-10-01',
            'created_by': self.user, 
        }
        self.event = Event.objects.create(**self.event_data)

    def test_create_event(self):
        event_data_post = {
            'name': 'Test Event',
            'event_type': 'off_water',
            'date': '2024-10-01',
            'created_by': self.user.id, 
        }
        url = reverse('events-list')
        response = self.client.post(url, data=event_data_post, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Event.objects.count(), 2)

    def test_get_event(self):
        # url = reverse('events-detail')
        response = self.client.get('/api/events/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # self.assertEqual(response.data['name'], self.event.name)

    def test_delete_event(self):
        url = reverse('events-detail', kwargs={'pk': self.event.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Event.objects.count(), 0)

    def test_delete_event_with_linked_volunteer_points(self):
        member = TeamMember.objects.create(
            australian_sailing_number=123,
            first_name='Brad',
            last_name='Doe',
            email='brad.doe@example.com',
            membership_category='Category1'
        )
        VolunteerPoints.objects.create(
            member=member,
            event=self.event,
            points=10,
            hours=2,
            created_by=self.user,
            activity=self.activity 
        )
        url = reverse('events-detail', kwargs={'pk': self.event.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Cannot delete event. There are volunteer histories linked to this event.", str(response.data))


class VolunteerPointsViewSetTests(APITestCase):
    def setUp(self):
        self.login_url = '/api/login/'
        
        # Create test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword',
            user_type='admin'
        )

        # Log in and get token
        data = {'username': 'testuser', 'password': 'testpassword'}
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Get the JWT token from the response
        token = response.data['access']  # JWT access token
        
        # Set the authorization header for subsequent requests
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)

        # Create test member, activity, and event
        self.member = TeamMember.objects.create(
            australian_sailing_number=123,
            first_name='John',
            last_name='Doe',
            email='john.doe@example.com',
            membership_category='Category1'
        )

        self.activity = Activity.objects.create(name='Test Activity')
        self.event = Event.objects.create(
            name='Test Event',
            event_type='on_water',
            date='2024-10-01',
            created_by=self.user
        )

        self.volunteer_point_data = {
            'member': self.member, 
            'event': self.event,  # Pass the ID, not the object
            'points': 10,
            'hours': 2,
            'created_by': self.user,
            'activity': self.activity  # Pass the ID, not the object
        }

    def test_create_volunteer_point(self):
        volunteer_point_data = {
            'member': self.member.australian_sailing_number,  # Pass the ID
            'event': self.event.id,  # Pass the ID
            'points': 10,
            'hours': 2,
            'created_by': self.user.id,
            'activity': self.activity.id  # Pass the ID
        }
        url = reverse('volunteer-points-list')
        response = self.client.post(url, data=volunteer_point_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(VolunteerPoints.objects.count(), 1)

    def test_get_volunteer_points(self):
        volunteer_point = VolunteerPoints.objects.create(**self.volunteer_point_data)
        url = reverse('volunteer-points-detail', kwargs={'pk': volunteer_point.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['points'], volunteer_point.points)

    def test_update_volunteer_point(self):
        volunteer_point = VolunteerPoints.objects.create(**self.volunteer_point_data)
        url = reverse('volunteer-points-detail', kwargs={'pk': volunteer_point.id})
        update_data = {'points': 20}
        response = self.client.patch(url, data=update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        volunteer_point.refresh_from_db()  # Refresh instance from DB
        self.assertEqual(volunteer_point.points, 20)

    def test_delete_volunteer_point(self):
        volunteer_point = VolunteerPoints.objects.create(**self.volunteer_point_data)
        url = reverse('volunteer-points-detail', kwargs={'pk': volunteer_point.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(VolunteerPoints.objects.count(), 0)

from django.test import TestCase
from rest_framework.test import APIClient, APITestCase
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.urls import reverse
from django.utils import timezone
from .models import User, Team, TeamMember, Activity, Event, VolunteerPoints
from io import BytesIO
import csv


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

    def test_create_admin_user(self):
        # Data for creating a new admin user
        data = {
            'username': 'newadmin',
            'password': 'newadminpass123',
            'email': 'newadmin@example.com',
            'user_type': 'admin'
        }
        # POST request to register a new admin user
        response = self.client.post(self.registration_url, data, format='json')

        # Assert that the user creation was successful
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Assert that the newly created user is an admin
        new_admin = User.objects.get(username='newadmin')
        self.assertEqual(new_admin.user_type, 'admin')


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
            email='testadminunique@example.com',  # Ensure unique email
            password='adminpass'
        )
        self.assertTrue(admin_user.is_admin)
    
    def test_string_representation(self):
        self.assertEqual(str(self.user), 'testuser')


class TeamModelTest(TestCase):
    def setUp(self):
        self.client = APIClient()  # Use APIClient for REST framework capabilities

        # Create a user to assign as team leader
        self.team_leader = User.objects.create_user(
            username='leader',
            email='leader@example.com',
            user_type=User.TEAM_LEADER,
            password='leaderpass'
        )
        response = self.client.post('/api/login/', {'username': 'leader', 'password': 'leaderpass'}, format='json')
        self.token = response.data['access']

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        self.create_team_url = '/api/teams/'
        
    
    def test_team_creation(self):
    # Create a team within the test method
        team = Team.objects.create(
            name='Test Team',
            description='A description of the test team',
            team_leader=self.team_leader
        )
        self.assertEqual(team.name, 'Test Team')
        self.assertEqual(team.description, 'A description of the test team')
        self.assertEqual(team.team_leader, self.team_leader)
    def test_team_creation_without_leader(self):
        team = Team.objects.create(
            name='Test Team',
            description='A description of the test team',
        )
        self.assertIsNone(team.team_leader)

    def test_team_creation_with_long_name(self):
        long_name = 'T' * 300  # Example of a very long name
        team = Team.objects.create(
            name=long_name,
            description='A description of the test team',
            team_leader=self.team_leader
        )
        self.assertEqual(len(team.name), 300)

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
class CSVImportTests(APITestCase):
    def setUp(self):
        self.login_url = '/api/login/'
        # Create a test user for each test to ensure isolation
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword',
            user_type='admin'
        )
        data = {'username': 'testuser', 'password': 'testpassword'}
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

        # Define the import URL endpoint
        self.import_csv_url = '/api/import-csv/'

    def test_import_csv_file(self):
        """Test importing team members from a CSV file"""

        # Create a sample CSV file in memory
        csv_content = (
        "AustralianSailing number,Firstname,Last name,Email address,Mobile,Payment status,Will you be volunteering or pay the volunteer levy?,Which volunteer team do you wish to join?\n"
        "12345,John,Doe,johndoe@example.com,0400000000,Gold,I will volunteer,Alpha\n"
        "67890,Jane,Smith,janesmith@example.com,0400000001,Silver,I will pay the levy,Beta\n"
    )
        csv_file = BytesIO(csv_content.encode())
        csv_file.name = 'team_members.csv'  # Required for Django file uploads

        # Make POST request to import the CSV file
        response = self.client.post(self.import_csv_url, {'file': csv_file}, format='multipart')
        response_data = response.json()

        # Validate the response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('new_records', response_data)
        self.assertIn('updated_records', response_data)
        self.assertIn('unchanged_records', response_data)

    # Check if two new records were created
        self.assertEqual(response_data['new_records'], 2)
        self.assertEqual(TeamMember.objects.count(), 2)  

class RemoveMemberFromTeamTest(APITestCase):
    def setUp(self):
        self.login_url = '/api/login/'
        # Create a test user for each test to ensure isolation
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword',
            user_type='admin'
        )
        data = {'username': 'testuser', 'password': 'testpassword'}
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
 
        self.team = Team.objects.create(name="Team Alpha", description="Test Team")
        self.member = TeamMember.objects.create(
            australian_sailing_number="12345", first_name="John", last_name="Doe", email="johndoe@example.com"
        )
        self.team.members.add(self.member)

        # URL for removing a member from the team
        self.url = reverse('remove_member_from_team', kwargs={'pk': self.team.pk})

    def test_remove_member_from_team(self):
        data = {'member': self.member.australian_sailing_number}
        response = self.client.post(self.url, data, format='json')

        # Check that the response is successful
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify that the member has been removed from the team
        self.team.refresh_from_db()
        self.assertNotIn(self.member, self.team.members.all())

        # Check the response data for accuracy
        response_data = response.json()
        self.assertEqual(response_data['id'], self.team.id)
        self.assertEqual(response_data['name'], self.team.name)


class DeleteUserTests(APITestCase):
    def setUp(self):
        # Create a test admin user for authentication
        self.admin_user = User.objects.create_user(
            username='testadmin_unique',
            email='testadmin_unique@example.com',  
            password='adminpass',
            user_type='admin'
        )
        # Log in and retrieve the token
        data = {'username': 'testadmin_unique', 'password': 'adminpass'}
        response = self.client.post('/api/login/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

        # Create a user to be deleted in the test
        self.user_to_delete = User.objects.create_user(
            username='user123_unique',
            email='user123@example.com',
            password='userpass',
            user_type='admin' 

        )

        # Create an 'admin' user to test the deletion restriction
        self.restricted_user = User.objects.create_user(
            username='restricted_admin_unique',
            email='admin_unique@example.com',  
            password='adminpass',
            user_type='admin'
        )

    def test_delete_user_success(self):
        url = reverse('delete_user', kwargs={'pk': self.user_to_delete.pk})
        response = self.client.delete(url)

        # Verify that the response indicates successful deletion
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "User deleted successfully")

        # Check that the user no longer exists in the database
        with self.assertRaises(User.DoesNotExist):
            User.objects.get(pk=self.user_to_delete.pk)

    def test_delete_nonexistent_user(self):
        url = reverse('delete_user', kwargs={'pk': 9999})  # Non-existent user ID
        response = self.client.delete(url)

        # Verify that the response indicates the user was not found
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "User not found")

   
class GetProfileViewTests(APITestCase):
    def setUp(self):
        self.login_url = '/api/login/'
        # Create a test user with an avatar
        self.user = User.objects.create_user(
            username='testuser',
            email='testuser@example.com',
            password='testpassword',
            user_type='admin' 

        )

        # Add an avatar to the test user (assuming an avatar field is available)
        self.user.avatar = 'path/to/avatar.jpg'  # Simulate an avatar file path
        self.user.save()

        # Log in the user to get the authentication token
        login_data = {'username': 'testuser', 'password': 'testpassword'}
        response = self.client.post(self.login_url, login_data, format='json')
        
        # Store the token to authenticate future requests
        self.token = response.data['access']  # Assuming JWT returns 'access' token
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

        # URL for the get profile API
        self.get_profile_url = reverse('get-profile')

    def test_get_profile_success(self):
        response = self.client.get(self.get_profile_url)

        # Validate the response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        profile_data = response.json()
        self.assertEqual(profile_data['username'], self.user.username)
        self.assertEqual(profile_data['email'], self.user.email)
        self.assertEqual(profile_data['avatar'], self.user.avatar.url if self.user.avatar else None)

    def test_get_profile_unauthenticated(self):
        # Log out the user to test unauthenticated access
        self.client.logout()
        response = self.client.get(self.get_profile_url)
        # Validate that the response indicates an unauthorized request
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
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

class AllMembersPointsAPIViewTest(APITestCase):
    def setUp(self):
        # Create a test user
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

        # Create a test team member
        self.member = TeamMember.objects.create(
            australian_sailing_number=123456,
            first_name="John",
            last_name="Doe",
            mobile="0400000000",
            email="john.doe@example.com",
            membership_category="Full Member"
        )

        # Create a test event
        self.event = Event.objects.create(
            name="Test Event",
            event_type="on_water",
            date="2024-10-01"
        )

        # Create a test volunteer point
        VolunteerPoints.objects.create(
            member=self.member,
            event=self.event,
            points=20,
            hours=3,
            created_by=self.user
        )

    def test_get_all_members_points(self):
        url = reverse('all-members-points')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)  # Expecting 1 result
        result = response.data[0]
        
        # Check the response structure and values
        self.assertEqual(result['name'], "John Doe")
        self.assertEqual(result['id'], "123456__2025")  # Financial year would be 2025 for event in 2024
        self.assertEqual(result['uid'], 123456)
        self.assertEqual(result['membership_category'], "Full Member")
        self.assertEqual(result['total_points'], 20)
        self.assertEqual(result['total_hours'], 3)

    def tearDown(self):
        self.client.logout()
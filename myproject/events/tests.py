from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from events.models import User  # Use your custom User model


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

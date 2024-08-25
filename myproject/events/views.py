from rest_framework import viewsets  # viewsets
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, BasePermission,AllowAny
from rest_framework.response import Response
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.generics import UpdateAPIView
from .models import TeamMember, Event, VolunteerPoints
import logging

logger = logging.getLogger(__name__)
from .serializers import (
    TeamMemberSerializer, 
    TeamMemberUpdateSerializer,
    EventSerializer, 
    VolunteerPointsSerializer,
    ChangePasswordSerializer,
)
class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

      
        if not username or not password:
            return Response({'message': 'Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)

       
        if User.objects.filter(username=username).exists():
            return Response({'message': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # crate admin user
            user = User.objects.create(
                username=username,
                password=make_password(password)  
            )
            return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)
        except Exception as e:
         
            return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class GetProfileView(APIView):
    permission_classes = [AllowAny] 

    def get(self, request):
        
        username = request.query_params.get('username')
        
        if not username:
            return Response({"detail": "Username not provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(username=username)
            profile_data = {
                'username': user.username,
                'email': user.email,
            }
            return Response(profile_data)
        except User.DoesNotExist:
            return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    
class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user and (request.user.is_staff or request.user.is_superuser)

class CreateAdminUserView(APIView):
    permission_classes = [AllowAny] 

    def post(self, request):
        logger.debug(f"Request made by: {request.user.username}, Is superuser: {request.user.is_superuser}")
        logger.debug(f"Request data: {request.data}")

        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email')

        if not username or not password or not email:
            return Response({'message': 'All fields are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(username=username).exists():
            return Response({"error": "User already exists"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.create(
                username=username,
                password=make_password(password),
                email=email,
                is_staff=True,
                is_superuser=True
            )
            logger.debug(f"Admin user created: {user.username}")
        
            return Response({"username": user.username, "message": "Admin user created successfully"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Failed to create admin user: {str(e)}")
            return Response({"error": "Failed to create admin user"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TeamMemberViewSet(viewsets.ModelViewSet):
    queryset = TeamMember.objects.all()
    serializer_class = TeamMemberSerializer
    permission_classes = [AllowAny]

    def list(self, request, *args, **kwargs):
        logger.debug(f"User: {request.user}, Authenticated: {request.user.is_authenticated}")
        return super().list(request, *args, **kwargs)
class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [AllowAny]

class VolunteerPointsViewSet(viewsets.ModelViewSet):
    queryset = VolunteerPoints.objects.all()
    serializer_class = VolunteerPointsSerializer
    permission_classes = [AllowAny]

from django.contrib.auth.models import User

class UpdateProfileView(APIView):
    permission_classes = [AllowAny]

    def put(self, request):
        try:
            user = User.objects.get(username=request.data.get('username'))
            new_username = request.data.get('new_username')
            new_email = request.data.get('email')

            if not new_username:
                return Response({"detail": "New username is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            if not new_email:
                return Response({"detail": "New email is required"}, status=status.HTTP_400_BAD_REQUEST)

            user.username = new_username
            user.email = new_email
            user.save()

            return Response({"detail": "Profile updated successfully"}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User

class ChangePasswordView(APIView):
    permission_classes = [AllowAny]  # Allow All for now

    def put(self, request):
        try:
            username = request.data.get('username')
            current_password = request.data.get('current_password')
            new_password = request.data.get('new_password')

         
            user = User.objects.get(username=username)

          
            if not user.check_password(current_password):
                return Response({"detail": "Current password is incorrect"}, status=status.HTTP_400_BAD_REQUEST)

         
            user.set_password(new_password)
            user.save()

            return Response({"detail": "Password updated successfully"}, status=status.HTTP_200_OK)
        
        except User.DoesNotExist:
            return Response({"detail": "User does not exist"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

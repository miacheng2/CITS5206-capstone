from rest_framework import viewsets  # viewsets
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, BasePermission,AllowAny
from rest_framework.response import Response
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
# from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.generics import UpdateAPIView
from rest_framework.decorators import api_view
from .models import User, Team, TeamMember, Event, VolunteerPoints
from .serializers import UserSerializer, TeamSerializer, TeamMemberSerializer, EventSerializer, VolunteerPointsSerializer,AuthTokenSerializer
from django.db.models import Sum, F, IntegerField
from django.contrib.auth import get_user_model
from django.db.models.functions import ExtractYear
from rest_framework_simplejwt.tokens import RefreshToken
from django.db import IntegrityError
import logging

logger = logging.getLogger(__name__)
from .serializers import (
    TeamMemberSerializer, 
    TeamMemberUpdateSerializer,
    EventSerializer, 
    VolunteerPointsSerializer,
    ChangePasswordSerializer,
)

User = get_user_model()

class RegisterView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        print(serializer.errors)  
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_200_OK)
        return Response({'detail': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
    
    
class CustomAuthToken(APIView):
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)
        if user:
            if user.is_active:
                refresh = RefreshToken.for_user(user)
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                })
            else:
                return Response({"detail": "Account is not active."}, status=status.HTTP_401_UNAUTHORIZED)
        else:
            return Response({"detail": "No active account found with the given credentials."}, status=status.HTTP_401_UNAUTHORIZED)    

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user  # super().validate(attrs) self.user

        data['user_type'] = user.user_type
        
     
        data['email'] = user.email
        data['is_admin'] = user.is_admin
        data['last_login'] = user.last_login.strftime('%Y-%m-%d %H:%M:%S') if user.last_login else None
        
        return data


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

# from django.contrib.auth.models import User

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
# from django.contrib.auth.models import User

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
        
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer

class TeamMemberViewSet(viewsets.ModelViewSet):
    queryset = TeamMember.objects.all()
    serializer_class = TeamMemberSerializer

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer

class VolunteerPointsViewSet(viewsets.ModelViewSet):
    queryset = VolunteerPoints.objects.all()
    serializer_class = VolunteerPointsSerializer

# get all members' point view
class AllMembersPointsAPIView(APIView):
    def get(self, request):
        # Aggregate points and hours by member and year
        points_data = VolunteerPoints.objects.select_related('member').annotate(
            year=ExtractYear('event__date')
        ).values(
            'member__name', 
            'member__australian_sailing_number', 
            'member__membership_category',
            'member__teams',
            'year'
        ).annotate(
            total_points=Sum('points'),
            total_hours=Sum('hours', output_field=IntegerField())
        ).order_by('member__name', 'year')
        
        # Convert the queryset to a list of dictionaries
        results = []
        for data in points_data:
            results.append({
                "name": data['member__name'],
                "id": data['member__australian_sailing_number'],
                "membership_category": data['member__membership_category'],
                "teams":data['member__teams'],
                "year": data['year'],
                "total_points": data['total_points'],
                "total_hours": data['total_hours'] or 0  # Handle case where hours might be null
            })
        
        return Response(results)


# update volunteer point view
@api_view(['POST'])
def save_volunteer_points(request):
    serializer = VolunteerPointsSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
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
from .models import User, Team, TeamMember, Event, VolunteerPoints,Member, VolunteerTeam
from .serializers import UserSerializer, TeamSerializer, EventSerializer, VolunteerPointsSerializer,AuthTokenSerializer,MemberSerializer
from django.db.models import Sum, F, IntegerField
from django.contrib.auth import get_user_model
from django.db.models.functions import ExtractYear
from rest_framework_simplejwt.tokens import RefreshToken
from django.db import IntegrityError
import logging
from rest_framework.decorators import action

logger = logging.getLogger(__name__)
from .serializers import (
  
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
                user_type='admin',
                is_admin=True
            )
            logger.debug(f"Admin user created: {user.username}")
        
            return Response({"username": user.username, "message": "Admin user created successfully"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Failed to create admin user: {str(e)}")
            return Response({"error": "Failed to create admin user"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TeamMemberViewSet(viewsets.ModelViewSet):
    queryset = TeamMember.objects.all()
    #serializer_class = TeamMemberSerializer
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
from django.contrib.auth.hashers import check_password
# from django.contrib.auth.models import User

class ChangePasswordView(APIView):
    permission_classes = [AllowAny] # Allow All for now

    def put(self, request):
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')

        user = request.user

        if not check_password(current_password, user.password):
            return Response({"detail": "Current password is incorrect"}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        return Response({"detail": "Password updated successfully"}, status=status.HTTP_200_OK)
        
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class PromoteLeaderView(APIView):
    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        
        try:
            if username:
                user = User.objects.get(username=username)
            elif email:
                user = User.objects.get(email=email)
            else:
                return Response({"error": "Username or Email is required."}, status=status.HTTP_400_BAD_REQUEST)
            
            user.user_type = User.TEAM_LEADER
            user.save()
            
            return Response({"message": f"{user.username} has been promoted to Team Leader."}, status=status.HTTP_200_OK)
        
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer

    

class MemberViewSet(viewsets.ModelViewSet):
    queryset = Member.objects.all()
    serializer_class = MemberSerializer
    lookup_field = 'australian_sailing_number'
    permission_classes = [AllowAny]
    @action(detail=True, methods=['put'])
    def update_member(self, request, pk=None):
        member = self.get_object()
        serializer = MemberSerializer(member, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'])
    def delete_member(self, request, pk=None):
        member = self.get_object()
        member.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
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

# add event point view
@api_view(['POST'])
def addEvent(request):
    serializer = EventSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


import os
import csv
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import FileSystemStorage
from django.conf import settings
from .models import Member, VolunteerTeam
from django.utils.timezone import now
from django.core.exceptions import ValidationError

@csrf_exempt
def import_csv(request):
    if request.method == 'POST' and request.FILES.get('file'):
        file = request.FILES['file']

        # Validate file extension
        if not file.name.endswith('.csv'):
            return JsonResponse({'status': 'error', 'message': 'Only CSV files are allowed.'}, status=400)

        fs = FileSystemStorage()
        filename = fs.save(file.name, file)
        file_path = fs.path(filename)

        new_records = 0
        updated_records = 0
        unchanged_records = 0

        try:
            with open(file_path, newline='', encoding='utf-8') as csvfile:
                reader = csv.reader(csvfile)
                
                next(reader, None)

                for row in reader:
                    
                    asn = row[0].strip()
                    first_name = row[1].strip()
                    last_name = row[2].strip()
                    mobile = row[3].strip()
                    email = row[4].strip()
                    payment_status = row[5].strip()
                    volunteer_levy = row[6].strip()
                    volunteer_teams = row[7].split(',')

                    member, created = Member.objects.get_or_create(australian_sailing_number=asn)

                    if created:
                        new_records += 1
                        for team_name in volunteer_teams:
                            team_name = team_name.strip()
                            if team_name:
                                team, _ = VolunteerTeam.objects.get_or_create(name=team_name)
                                member.volunteer_teams.add(team)

                    if (
                        member.first_name == first_name and
                        member.last_name == last_name and
                        member.mobile == mobile and
                        member.email_address == email and
                        member.payment_status == payment_status and
                        member.volunteer_levy == volunteer_levy
                    ):
                        unchanged_records += 1
                    else:
                        updated_records += 1
                        member.first_name = first_name
                        member.last_name = last_name
                        member.mobile = mobile
                        member.email_address = email
                        member.payment_status = payment_status
                        member.volunteer_levy = volunteer_levy
                        member.save()

            return JsonResponse({
                'status': 'success',
                'new_records': new_records,
                'updated_records': updated_records,
                'unchanged_records': unchanged_records
            })

        except csv.Error as e:
            return JsonResponse({'status': 'error', 'message': f'CSV parsing error: {str(e)}'}, status=400)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': f'An unexpected error occurred: {str(e)}'}, status=400)
        finally:
            
            if os.path.exists(file_path):
                os.remove(file_path)

    return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)
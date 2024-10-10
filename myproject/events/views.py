# Standard Libraries
import os
import re
import csv
import logging
from time import timezone

# Django Imports
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.contrib.auth.models import User  # Uncomment if needed
from django.core.files.storage import FileSystemStorage
from django.db.models import Sum, F, IntegerField, Value, Case, When, ExpressionWrapper
from django.db.models.functions import ExtractYear, Concat
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.views.decorators.csrf import csrf_exempt

# Third-party Imports
from rest_framework import status, serializers, viewsets
from rest_framework.permissions import IsAuthenticated, BasePermission, AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes, action

# Local App Imports
from .models import User, Team, TeamMember, Event, VolunteerPoints, Activity
from .serializers import UserSerializer, TeamSerializer, TeamMemberSerializer, EventSerializer, VolunteerPointsSerializer, DetailedTeamSerializer, DetailedTeamMemberSerializer, AuthTokenSerializer, ActivitySerializer
from .utils import send_password_reset_email


logger = logging.getLogger(__name__)
from .serializers import (
    TeamMemberSerializer, 
    TeamMemberUpdateSerializer,
    VolunteerPointsSerializer,
    ChangePasswordSerializer,
)

User = get_user_model()

class RegisterView(APIView):
    permission_classes = [AllowAny] 

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()  # Save the user

            # Generate JWT tokens for the newly created user
            refresh = RefreshToken.for_user(user)
            
            # Return the user data along with the JWT tokens
            return Response({
                'user': serializer.data,
                'refresh': str(refresh),
                'access': str(refresh.access_token)
            }, status=status.HTTP_201_CREATED)

        print(serializer.errors)  # For debugging purposes
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        # Check if both username and password are provided
        if not username or not password:
            return Response({'detail': 'Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if the username exists
        if not User.objects.filter(username=username).exists():
            return Response({'detail': 'Username does not exist'}, status=status.HTTP_401_UNAUTHORIZED)

        # Authenticate the user (check the password)
        user = authenticate(username=username, password=password)
        if user is not None:
            # Generate JWT tokens for authenticated user
            refresh = RefreshToken.for_user(user)
            user_role = user.user_type  # Retrieve user role from the user model
            
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user_role': user_role  # Include the user role in the response
            }, status=status.HTTP_200_OK)
        
        # If authentication fails, it means the password is incorrect
        return Response({'detail': 'Incorrect password'}, status=status.HTTP_401_UNAUTHORIZED)
@api_view(['DELETE'])
def delete_user(request, pk):
    try:
        user = User.objects.get(pk=pk)
        
        # Check if the user is 'admin' and prevent deletion
        if user.username == 'admin':
            return Response({"error": "The 'admin' user cannot be deleted."}, status=status.HTTP_403_FORBIDDEN)
        
        user.delete()
        return Response({"message": "User deleted successfully"}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    
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

@api_view(['GET'])
def admin_list(request):
    # Fetch all users who are either admins or team leaders
    users = User.objects.filter(user_type__in=['admin', 'team_leader'])  # Adjust based on your roles
    user_data = []
    for user in users:
        user_data.append({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'user_type': user.user_type,  # Assuming user_type is either 'admin' or 'team_leader'
        })
    return Response(user_data)

class GetProfileView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure only authenticated users can access this view

    def get(self, request):
        user = request.user  # Get the currently logged-in user

        # Prepare profile data
        profile_data = {
            'username': user.username,
            'email': user.email,
             'avatar': user.avatar.url if user.avatar else None,  # Include avatar URL

        }

        return Response(profile_data, status=status.HTTP_200_OK)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_counts(request):
    # Count the number of admins and team leaders
    admin_count = User.objects.filter(user_type='admin').count()
    team_leader_count = User.objects.filter(user_type='team_leader').count()

    return Response({
        'admin_count': admin_count,
        'team_leader_count': team_leader_count,
    })
    
class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.user_type == 'admin'

class CreateAdminUserView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

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
        
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def team_with_members(request):
    teams = Team.objects.prefetch_related('members').select_related('team_leader').all()
    data = []
    for team in teams:
        members = DetailedTeamMemberSerializer(team.members.all(), many=True).data
        data.append({
            'id': team.id,
            'name': team.name,
            'description': team.description,
            'team_leader': team.team_leader.username if team.team_leader else None,  # Fetch the username
            'creation_date': team.creation_date,  # Add creation_date to the response
            'last_modified_date': team.last_modified_date,  
            'members': members
        })
    return Response(data)

@api_view(['POST'])
def update_team_members(request, team_id):
    try:
        team = Team.objects.get(id=team_id)
        members_data = request.data.get('members', [])
        
        # Assuming `members_data` is a list of Australian Sailing Numbers
        members = TeamMember.objects.filter(australian_sailing_number__in=members_data)

        # Update the team members
        team.members.set(members)

        return Response({"message": "Team members updated successfully"}, status=status.HTTP_200_OK)
    except Team.DoesNotExist:
        return Response({"error": "Team not found"}, status=status.HTTP_404_NOT_FOUND)
        
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['POST'])
def remove_member_from_team(request, pk):
    try:
        team = Team.objects.get(pk=pk)
    except Team.DoesNotExist:
        return Response({"error": "Team not found"}, status=status.HTTP_404_NOT_FOUND)
    
    member_id = request.data.get('member')
    if not member_id:
        return Response({"error": "No member ID provided"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        member = TeamMember.objects.get(australian_sailing_number=member_id)
        team.members.remove(member)  # Remove the member from the team
    except TeamMember.DoesNotExist:
        return Response({"error": f"Member with ID {member_id} not found"}, status=status.HTTP_404_NOT_FOUND)
    
    team.save()
    serializer = DetailedTeamSerializer(team)
    return Response(serializer.data, status=status.HTTP_200_OK)

class TeamMemberViewSet(viewsets.ModelViewSet):
    queryset = TeamMember.objects.all()
    serializer_class = TeamMemberSerializer
    permission_classes = [IsAuthenticated]
    
    def list(self, request, *args, **kwargs):
        logger.debug(f"User: {request.user}, Authenticated: {request.user.is_authenticated}")
        return super().list(request, *args, **kwargs)




class DetailedTeamMemberViewSet(viewsets.ModelViewSet):
    queryset = TeamMember.objects.all()
    serializer_class = DetailedTeamMemberSerializer
    lookup_field = 'australian_sailing_number'
    permission_classes = [IsAuthenticated]
    

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    


class UpdateProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        try:
            user = request.user  
            
            new_username = request.data.get('new_username')
            new_email = request.data.get('email')
            avatar = request.FILES.get('avatar')  # Get the avatar file

            if new_username:
                user.username = new_username
            if new_email:
                user.email = new_email
            if avatar:
                user.avatar = avatar  # Save the new avatar

            user.save()

            return Response({
                "username": user.username,
                "email": user.email,
                "avatar": user.avatar.url if user.avatar else None  # Ensure avatar URL is returned
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated] # user only

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


@api_view(['POST'])
@permission_classes([IsAuthenticated])  # Adjust permission as needed
def remove_members(request, team_id):
    try:
        # Get the team by its ID
        team = Team.objects.get(id=team_id)

        # Get the list of members to be removed from the request data
        member_ids = request.data.get('members', [])

        if not member_ids:
            return Response({'detail': 'No members provided.'}, status=status.HTTP_400_BAD_REQUEST)

        # Iterate over the member IDs and remove them from the team
        for member_id in member_ids:
            try:
                member = TeamMember.objects.get(australian_sailing_number=member_id)
                team.members.remove(member)  # Remove the member from the team's members
            except TeamMember.DoesNotExist:
                return Response({'detail': f'Team member with ID {member_id} does not exist.'}, status=status.HTTP_400_BAD_REQUEST)

        team.save()  # Save changes to the team

        return Response({'detail': 'Members removed successfully.'}, status=status.HTTP_200_OK)

    except Team.DoesNotExist:
        return Response({'detail': 'Team not found.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'detail': f'An error occurred: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
@api_view(['GET'])
def get_team_leaders(request):
    team_leaders = User.objects.filter(user_type='team_leader')  # select team_leader 
    serializer = UserSerializer(team_leaders, many=True)
    return Response(serializer.data)
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
    permission_classes = [IsAuthenticated] 

@api_view(['POST'])
def create_team(request):
    # Use the serializer for validation and team creation
    serializer = DetailedTeamSerializer(data=request.data)
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class DetailedTeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = DetailedTeamSerializer
    permission_classes = [IsAuthenticated] 

@api_view(['POST'])
def create_team(request):
    
    team_leader_id = request.data.get('team_leader')
    description = request.data.get('description')
    

    # pass team_leader ID
    team_leader = None
    if team_leader_id:
        try:
            team_leader = User.objects.get(id=team_leader_id)
        except User.DoesNotExist:
            return Response({"error": "Team leader not found"}, status=status.HTTP_400_BAD_REQUEST)

    team = Team.objects.create(
        name=request.data.get('name'),
        description=description or "No description available",
        creation_date=timezone.now().date()
    )

    
    if team_leader:
        team.team_leader = team_leader
        team.save()

    serializer = DetailedTeamSerializer(team)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['DELETE'])
def delete_team(request, team_id):
    try:
        team = Team.objects.get(id=team_id)
        team.delete()
        return Response({"message": "Team deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
    except Team.DoesNotExist:
        return Response({"error": "Team not found"}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(['DELETE'])
def delete_multiple_teams(request):
    print("DELETE request received")
    team_names = request.data.get('team_names', [])  
    print(f"Team names to delete: {team_names}") 
    if not team_names:
        return Response({"error": "No team names provided"}, status=status.HTTP_400_BAD_REQUEST)

    teams_to_delete = Team.objects.filter(name__in=team_names)  
    if not teams_to_delete.exists():
        return Response({"error": "Teams not found"}, status=status.HTTP_404_NOT_FOUND)

    deleted_team_names = [team.name for team in teams_to_delete]
    teams_to_delete.delete()

    return Response({"message": "Teams deleted successfully", "deleted_team_names": deleted_team_names}, status=status.HTTP_200_OK)

def update_team_members(request, pk):
    team = get_object_or_404(Team, pk=pk)
    if request.method == 'POST':
        members = request.POST.getlist('members')  # List of member IDs (australian_sailing_number)
        team.members.set(members)  # Update team members (will replace the old members)
        return JsonResponse({'status': 'success', 'message': 'Team members updated successfully.'})
    return JsonResponse({'status': 'error', 'message': 'Invalid request method.'}, status=405)

@api_view(['POST'])
def add_member_to_team(request, pk):
    try:
        team = Team.objects.get(pk=pk)
    except Team.DoesNotExist:
        return Response({"error": "Team not found"}, status=status.HTTP_404_NOT_FOUND)
    
    member_ids = request.data.get('members', [])
    for member_id in member_ids:
        try:
            member = TeamMember.objects.get(australian_sailing_number=member_id)
            team.members.add(member) 
        except TeamMember.DoesNotExist:
            return Response({"error": f"Member with ID {member_id} not found"}, status=status.HTTP_404_NOT_FOUND)

    team.save()
    serializer = DetailedTeamSerializer(team)
    return Response(serializer.data, status=status.HTTP_200_OK)

# get, create and delete events
class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]  # Require authentication for all actions

    def create(self, request, *args, **kwargs):
        """Create a new event."""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        """Delete a specific event if it is not linked to any volunteer history."""
        try:
            event = self.get_object()  # Get the event instance
        except Event.DoesNotExist:
            return Response({"error": "Event not found."}, status=status.HTTP_404_NOT_FOUND)

        # Check if there are any volunteer points linked to this event
        linked_volunteer_points = VolunteerPoints.objects.filter(event=event).exists()

        if linked_volunteer_points:
            return Response(
                {"error": "Cannot delete event. There are volunteer histories linked to this event."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # If no linked volunteer points, proceed to delete the event
        event.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
# create, get, update, delete one member's point
class VolunteerPointsViewSet(viewsets.ModelViewSet):
    queryset = VolunteerPoints.objects.all()
    serializer_class = VolunteerPointsSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except serializers.ValidationError as e:
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        """Update points and hours for a specific volunteer entry."""
        try:
            instance = self.get_object()
        except VolunteerPoints.DoesNotExist:
            return Response({"error": "VolunteerPoint not found."}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = VolunteerPointsSerializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        """Delete a specific volunteer entry."""
        try:
            instance = VolunteerPoints.objects.get(pk=pk)
        except VolunteerPoints.DoesNotExist:
            return Response({"error": "VolunteerPoint not found."}, status=status.HTTP_404_NOT_FOUND)

        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods=['get'], url_path='member-history/(?P<uid>[^/.]+)')
    def member_volunteer_history(self, request, uid=None):
        """Retrieve volunteer history for a specific member."""
        points = VolunteerPoints.objects.filter(member__australian_sailing_number=uid).select_related('event', 'activity')
        history = [
            {
                "id": point.id,
                "event_name": point.event.name,
                "event_date": point.event.date,
                "activity": point.activity.name if point.activity else None,
                "points": int(point.points+0.5),
                "hours": int(point.hours+0.5),
                "created_by": point.created_by.username
            }
            for point in points
        ]
        return Response(history)
    
    @action(detail=False, methods=['get'], url_path='event-history/(?P<event_id>[^/.]+)')
    def event_volunteer_history(self, request, event_id=None):
        """Retrieve volunteer points linked to a specific event."""
        event = Event.objects.get(id=event_id)
        team_leader = event.team.team_leader  # Assuming there's a team_leader field in Team
        
        # Check if the user is an admin or team leader of the team
        if not request.user.is_staff and request.user != team_leader:
            return Response({"detail": "You do not have permission to view this event's history."}, status=status.HTTP_403_FORBIDDEN)
        
        # If authorized, return the volunteer history
        points = VolunteerPoints.objects.filter(event_id=event_id).select_related('member', 'activity')
        history = [
            {
                "id": point.id,
                "member": point.member.australian_sailing_number,
                "points": int(point.points + 0.5),
                "hours": int(point.hours + 0.5),
                "activity": point.activity.name if point.activity else None,
                "created_by": point.created_by.username
            }
            for point in points
        ]
        return Response(history)

# get all members' point view
@permission_classes([IsAuthenticated])  # to require authentication
class AllMembersPointsAPIView(APIView):
    def get(self, request):
        # Custom annotation to get the financial year
        points_data = VolunteerPoints.objects.select_related('member').annotate(
            event_year=ExtractYear('event__date'),
            financial_year=Case(
                When(event__date__month__gte=7, then=F('event_year') + 1),  # July to December
                default=F('event_year'),  # January to June
                output_field=IntegerField()
            ),
            name=Concat(F('member__first_name'), Value(' '), F('member__last_name'))  # Concatenate first and last names
        ).values(
            'name',  # Use the newly annotated 'name' field
            'member__australian_sailing_number', 
            'member__membership_category',
            'member__teams',
            'financial_year'
        ).annotate(
            total_points=Sum('points'),
            total_hours=Sum('hours')
        ).order_by('name', 'financial_year')
        
        # Convert the queryset to a list of dictionaries
        results = []
        for data in points_data:
            results.append({
                "name": data['name'],
                "id": f"{data['member__australian_sailing_number']}__{data['financial_year']}",
                "uid": data['member__australian_sailing_number'],
                "membership_category": data['member__membership_category'],
                "teams": data['member__teams'],
                "year": data['financial_year'],  # Use 'financial_year' instead of 'year'
                "total_points": int(data['total_points']+0.5),
                "total_hours": int(data['total_hours']+0.5) or 0  # Handle case where hours might be null
            })
        
        return Response(results)


@csrf_exempt
@permission_classes([IsAuthenticated, IsAdminUser])  # Require authentication
def import_csv(request):
    if request.method == 'POST' and request.FILES.get('file'):
        file = request.FILES['file']

        if not file.name.endswith('.csv'):
            return JsonResponse({'status': 'error', 'message': 'Only CSV files are allowed.'}, status=400)

        fs = FileSystemStorage()
        filename = fs.save(file.name, file)
        file_path = fs.path(filename)

        new_records = 0
        updated_records = 0
        unchanged_records = 0
        validation_errors = []

        try:
            with open(file_path, newline='', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)  # Use DictReader to map column names dynamically

                required_columns = [
                    'AustralianSailing number',
                    'Firstname',
                    'Last name',
                    'Mobile',
                    'Payment status',
                    'Will you be volunteering or pay the volunteer levy?',
                    'Which volunteer team do you wish to join?',
                    'Email address'
                ]

                # Check if the CSV has all required columns
                missing_columns = [col for col in required_columns if col not in reader.fieldnames]
                if missing_columns:
                    return JsonResponse({'status': 'error', 'message': f'Invalid CSV format. Missing required columns: {", ".join(missing_columns)}'}, status=400)

                for row_number, row in enumerate(reader, start=2):  # Start at row 2 (header is row 1)
                    # Map CSV fields to variables based on their actual column names
                    asn = row.get('AustralianSailing number', '').strip()
                    first_name = row.get('Firstname', '').strip()
                    last_name = row.get('Last name', '').strip()
                    email = row.get('Email address', '').strip()
                    mobile = row.get('Mobile', '').strip()
                    membership_category = row.get('Payment status', '').strip()
                    will_volunteer_or_pay_levy = row.get('Will you be volunteering or pay the volunteer levy?', '').strip()
                    team_names = row.get('Which volunteer team do you wish to join?', '').split(',')

                    # Validate email format
                    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
                        validation_errors.append(f"Row {row_number}: Invalid email '{email}'.")
                        continue  # Skip this row

                    # Process and create or update the team member
                    teammember, created = TeamMember.objects.get_or_create(
                        australian_sailing_number=asn,
                        defaults={
                            'first_name': first_name,
                            'last_name': last_name,
                            'email': email,
                            'mobile': mobile,  # Accept mobile as it is (any format)
                            'membership_category': membership_category,
                            'will_volunteer_or_pay_levy': will_volunteer_or_pay_levy,
                        }
                    )

                    if created:
                        new_records += 1
                    else:
                        # Check if any updates are needed
                        if (teammember.first_name != first_name or
                            teammember.last_name != last_name or
                            teammember.email != email or
                            teammember.mobile != mobile or
                            teammember.membership_category != membership_category or
                            teammember.will_volunteer_or_pay_levy != will_volunteer_or_pay_levy):
                            # Update fields if they differ
                            teammember.first_name = first_name
                            teammember.last_name = last_name
                            teammember.email = email
                            teammember.mobile = mobile
                            teammember.membership_category = membership_category
                            teammember.will_volunteer_or_pay_levy = will_volunteer_or_pay_levy
                            teammember.save()
                            updated_records += 1
                        else:
                            unchanged_records += 1

                    # Add teams
                    for team_name in team_names:
                        team_name = team_name.strip()
                        if team_name:
                            team, _ = Team.objects.get_or_create(name=team_name)
                            teammember.teams.add(team)

            return JsonResponse({
                'status': 'success',
                'new_records': new_records,
                'updated_records': updated_records,
                'unchanged_records': unchanged_records,
                'validation_errors': validation_errors
            })

        except csv.Error as e:
            return JsonResponse({'status': 'error', 'message': f'CSV parsing error: {str(e)}'}, status=400)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': f'An unexpected error occurred: {str(e)}'}, status=400)
        finally:
            if os.path.exists(file_path):
                os.remove(file_path)

    return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)



@api_view(['GET'])
def get_activities_for_event(request, event_id):
    event = get_object_or_404(Event, id=event_id)
    activities = event.activities.all() # Assuming Event has a ForeignKey relationship with Activity
    serializer = ActivitySerializer(activities, many=True)
    return Response(serializer.data)

class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, uidb64, token):
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        token_generator = PasswordResetTokenGenerator()
        if user and token_generator.check_token(user, token):
            new_password = request.data.get('new_password')
            if not new_password:
                return Response({'detail': 'New password is required'}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(new_password)
            user.save()
            return Response({'detail': 'Password has been reset successfully.'}, status=status.HTTP_200_OK)
        else:
            return Response({'detail': 'Invalid token or user ID.'}, status=status.HTTP_400_BAD_REQUEST)
        
class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'detail': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            send_password_reset_email(user, request)
            return Response({'detail': 'Password reset link sent to email.'}, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response({'detail': 'User with this email does not exist.'}, status=status.HTTP_404_NOT_FOUND)
        

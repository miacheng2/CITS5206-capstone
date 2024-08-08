from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.generics import UpdateAPIView
from .models import TeamMember, Event, VolunteerPoints
from .serializers import (
    TeamMemberSerializer, 
    TeamMemberUpdateSerializer,
    EventSerializer, 
    VolunteerPointsSerializer,
    ChangePasswordSerializer,
)

class TeamMemberViewSet(viewsets.ModelViewSet):
    queryset = TeamMember.objects.all()
    serializer_class = TeamMemberSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        user_data = {
            'username': request.data['username'],
            'password': request.data['password'],
            'email': request.data['email']
        }
        user = User.objects.create_user(**user_data)
        team_member_data = {
            'user': user,
            'name': request.data['name'],
            'email': request.data['email'],
            'membership_category': request.data['membership_category']
        }
        team_member_serializer = self.get_serializer(data=team_member_data)
        team_member_serializer.is_valid(raise_exception=True)
        team_member_serializer.save()
        headers = self.get_success_headers(team_member_serializer.data)
        return Response(team_member_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]

class VolunteerPointsViewSet(viewsets.ModelViewSet):
    queryset = VolunteerPoints.objects.all()
    serializer_class = VolunteerPointsSerializer
    permission_classes = [IsAuthenticated]

class UpdateProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user
        try:
            team_member = user.teammember
        except TeamMember.DoesNotExist:
            return Response({"detail": "Team member profile not found"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = TeamMemberUpdateSerializer(team_member, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ChangePasswordView(UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    model = User
    permission_classes = [IsAuthenticated]

    def get_object(self, queryset=None):
        return self.request.user

    def update(self, request, *args, **kwargs):
        self.object = self.get_object()
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            # Check old password
            if not self.object.check_password(serializer.data.get("old_password")):
                return Response({"old_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)

            # Set new password
            self.object.set_password(serializer.data.get("new_password"))
            self.object.save()
            return Response({"status": "password set"}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

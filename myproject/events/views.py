from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import TeamMember, Event, VolunteerPoints
from .serializers import TeamMemberSerializer, EventSerializer, VolunteerPointsSerializer

class TeamMemberViewSet(viewsets.ModelViewSet):
    queryset = TeamMember.objects.all()
    serializer_class = TeamMemberSerializer
    permission_classes = [IsAuthenticated]

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]

class VolunteerPointsViewSet(viewsets.ModelViewSet):
    queryset = VolunteerPoints.objects.all()
    serializer_class = VolunteerPointsSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        if not self.request.user.is_staff:
            return VolunteerPoints.objects.none()  # Non-admins cannot access points data
        return super().get_queryset()

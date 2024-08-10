from django.shortcuts import render
from rest_framework import viewsets
from .models import Member, Event, VolunteerLog
from .serializers import MemberSerializer, EventSerializer, VolunteerLogSerializer
from django.http import HttpResponse

def home_view(request):
    return HttpResponse("<h1>Welcome to the Volunteer Management System</h1>")

class MemberViewSet(viewsets.ModelViewSet):
    queryset = Member.objects.all()
    serializer_class = MemberSerializer

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer

class VolunteerLogViewSet(viewsets.ModelViewSet):
    queryset = VolunteerLog.objects.all()
    serializer_class = VolunteerLogSerializer

# Create your views here.

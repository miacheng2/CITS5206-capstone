from rest_framework import serializers
from .models import TeamMember, Event, VolunteerPoints

class TeamMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamMember
        fields = '__all__'

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'

class VolunteerPointsSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerPoints
        fields = '__all__'

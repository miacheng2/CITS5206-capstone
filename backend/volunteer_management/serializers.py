from rest_framework import serializers
from .models import Member, Event, VolunteerLog

class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = '__all__'

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'

class VolunteerLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerLog
        fields = '__all__'

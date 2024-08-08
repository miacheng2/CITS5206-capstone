from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import TeamMember, Event, VolunteerPoints

class TeamMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamMember
        fields = '__all__'

class TeamMemberUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamMember
        fields = ['name', 'email', 'membership_category']

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'

class VolunteerPointsSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerPoints
        fields = '__all__'

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_new_password(self, value):
        validate_password(value)
        return value


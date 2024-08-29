from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import User, Team, TeamMember, Event, VolunteerPoints

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'username', 'user_type']

class TeamMemberUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamMember
        fields = ['name', 'email', 'membership_category']

class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ['id', 'name', 'description', 'creation_date']

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['id', 'name', 'event_type', 'date', 'created_by']

class VolunteerPointsSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerPoints
        fields = ['member', 'event', 'points', 'hours', 'created_by']

class TeamMemberSerializer(serializers.ModelSerializer):
    teams = TeamSerializer(many=True, read_only=True)

    class Meta:
        model = TeamMember
        fields = ['australian_sailing_number', 'name', 'email', 'membership_category', 'will_volunteer_or_pay_levy', 'teams']

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_new_password(self, value):
        validate_password(value)
        return value


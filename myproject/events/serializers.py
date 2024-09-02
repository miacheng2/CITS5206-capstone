from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import User, Team, TeamMember, Event, VolunteerPoints,Member,VolunteerTeam


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'user_type']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate_user_type(self, value):
        if value not in ['admin', 'team_leader']:
            raise serializers.ValidationError("Invalid user type")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class AuthTokenSerializer(serializers.Serializer):
    username = serializers.CharField(label="Username")
    password = serializers.CharField(
        label="Password",
        style={'input_type': 'password'},
        trim_whitespace=False
    )

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            
            return attrs
        else:
            raise serializers.ValidationError("Username and password are required.")
        
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

class VolunteerTeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerTeam
        fields = ['name']

class MemberSerializer(serializers.ModelSerializer):
    volunteer_teams = VolunteerTeamSerializer(many=True, read_only=True)
    class Meta:
        model = Member
        fields = ['australian_sailing_number', 'first_name', 'last_name','email_address', 'mobile', 'payment_status', 'volunteer_levy', 'volunteer_teams']
class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_new_password(self, value):
        validate_password(value)
        return value


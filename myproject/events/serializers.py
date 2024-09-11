from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import User, Team, TeamMember, Event, VolunteerPoints,Activity

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id','username', 'email', 'password', 'user_type']
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




class DetailedTeamSerializer(serializers.ModelSerializer):
    total_members = serializers.SerializerMethodField()
    team_leader_name = serializers.SerializerMethodField()
    members = serializers.PrimaryKeyRelatedField(queryset=TeamMember.objects.all(), many=True) 

    class Meta:
        model = Team
        fields = ['id', 'name', 'description', 'team_leader', 'team_leader_name', 'creation_date', 'last_modified_date', 'total_members','members']

    def get_total_members(self, obj):
        return obj.members.count()

    def get_team_leader_name(self, obj):
        if obj.team_leader:
            return obj.team_leader.username  
        return "No leader"
    
    def create(self, validated_data):
        members_data = validated_data.pop('members', [])  
        team = Team.objects.create(**validated_data)

      
        for member_data in members_data:
            member = TeamMember.objects.get(australian_sailing_number=member_data['australian_sailing_number'])
            team.members.add(member)

        return team

    

    def update(self, instance, validated_data):
        members_data = validated_data.pop('members', [])
        instance.name = validated_data.get('name', instance.name)
        instance.description = validated_data.get('description', instance.description)
        instance.team_leader = validated_data.get('team_leader', instance.team_leader)
        instance.save()

      
        if members_data:
            instance.members.set(members_data)

        return instance
    
class DetailedTeamMemberSerializer(serializers.ModelSerializer):
    teams = DetailedTeamSerializer(many=True, read_only=True)

    class Meta:
        model = TeamMember
        fields = ['australian_sailing_number', 'first_name', 'last_name', 'email', 'mobile', 'membership_category', 'will_volunteer_or_pay_levy', 'teams']
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
            'australian_sailing_number': {'required': True},
        }
    def create(self, validated_data):
        teams_data = validated_data.pop('teams', [])  
        team_member = TeamMember.objects.create(**validated_data)
        for team_data in teams_data:
            team, created = Team.objects.get_or_create(name=team_data['name'], defaults=team_data)
            team_member.teams.add(team)
        return team_member
    
class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ['id', 'name', 'description', 'creation_date']

class TeamMemberSerializer(serializers.ModelSerializer):
    teams = TeamSerializer(many=True, read_only=True)

    class Meta:
        model = TeamMember
        fields = ['australian_sailing_number', 'name', 'email', 'membership_category', 'will_volunteer_or_pay_levy', 'teams'] 






class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = ['id', 'name']

class EventSerializer(serializers.ModelSerializer):
    activities = ActivitySerializer(many=True, required=False)  # activities is optional

    class Meta:
        model = Event
        fields = ['id', 'name', 'event_type', 'date', 'created_by', 'activities']

    def create(self, validated_data):
        activities_data = validated_data.pop('activities', [])
        event = Event.objects.create(**validated_data)
        if activities_data:  # Check if activities_data is not empty
            for activity_data in activities_data:
                activity, created = Activity.objects.get_or_create(name=activity_data['name'])
                event.activities.add(activity)
        return event

class VolunteerPointsSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerPoints
        fields = ['member', 'event', 'points', 'hours', 'created_by']





class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_new_password(self, value):
        validate_password(value)
        return value


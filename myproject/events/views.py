from rest_framework import viewsets  # 确保导入 viewsets
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, BasePermission,AllowAny
from rest_framework.response import Response
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.generics import UpdateAPIView
from .models import TeamMember, Event, VolunteerPoints
import logging

logger = logging.getLogger(__name__)
from .serializers import (
    TeamMemberSerializer, 
    TeamMemberUpdateSerializer,
    EventSerializer, 
    VolunteerPointsSerializer,
    ChangePasswordSerializer,
)
class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        # 检查用户名和密码是否提供
        if not username or not password:
            return Response({'message': 'Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        # 检查用户名是否已存在
        if User.objects.filter(username=username).exists():
            return Response({'message': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # 创建用户
            user = User.objects.create(
                username=username,
                password=make_password(password)  # 确保密码被哈希处理
            )
            return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            # 捕获其他异常并返回错误信息
            return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class GetProfileView(APIView):
    permission_classes = [AllowAny]  # 允许任何人访问此视图

    def get(self, request):
        logger.info(f"Request received. User: {request.user}")

        if request.user.is_authenticated:
            profile_data = {
                'username': request.user.username,
                'email': request.user.email,
            }
            logger.info(f"Profile data sent: {profile_data}")
            return Response(profile_data, status=status.HTTP_200_OK)
        else:
            logger.warning("Unauthenticated request.")
            return Response({"detail": "User not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)
    
class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user and (request.user.is_staff or request.user.is_superuser)

class CreateAdminUserView(APIView):
    permission_classes = [AllowAny] 

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
                is_staff=True,
                is_superuser=True
            )
            logger.debug(f"Admin user created: {user.username}")
        
            return Response({"username": user.username, "message": "Admin user created successfully"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Failed to create admin user: {str(e)}")
            return Response({"error": "Failed to create admin user"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TeamMemberViewSet(viewsets.ModelViewSet):
    queryset = TeamMember.objects.all()
    serializer_class = TeamMemberSerializer
    permission_classes = [AllowAny]

    def list(self, request, *args, **kwargs):
        logger.debug(f"User: {request.user}, Authenticated: {request.user.is_authenticated}")
        return super().list(request, *args, **kwargs)
class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [AllowAny]

class VolunteerPointsViewSet(viewsets.ModelViewSet):
    queryset = VolunteerPoints.objects.all()
    serializer_class = VolunteerPointsSerializer
    permission_classes = [IsAuthenticated]

class UpdateProfileView(APIView):
    permission_classes = [AllowAny]  # 确保只有已认证用户可以访问此视图

    def put(self, request):
        user = request.user
        try:
            # 获取请求中的数据
            username = request.data.get('username')
            email = request.data.get('email')

            # 更新用户的用户名和电子邮件
            if username:
                user.username = username
            if email:
                user.email = email
            
            # 保存更改
            user.save()

            return Response({
                "username": user.username,
                "email": user.email,
                "message": "Profile updated successfully"
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

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

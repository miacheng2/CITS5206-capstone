from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from events.views import (TeamMemberViewSet, EventViewSet, VolunteerPointsViewSet, ChangePasswordView, UpdateProfileView,
CreateAdminUserView,RegisterView,GetProfileView,UpdateProfileView, UserViewSet, TeamViewSet, TeamMemberViewSet, EventViewSet, VolunteerPointsViewSet,AllMembersPointsAPIView,save_volunteer_points) 

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'teams', TeamViewSet)
router.register(r'team-members', TeamMemberViewSet)
router.register(r'events', EventViewSet)
router.register(r'volunteer-points', VolunteerPointsViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/token-auth/', obtain_auth_token),
    path('api/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('api/update-profile/', UpdateProfileView.as_view(), name='update-profile'),
    path('api/create-admin/', CreateAdminUserView.as_view(), name='create-admin'),
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/get-profile/', GetProfileView.as_view(), name='get-profile'),
    path('api/members-points-all/', AllMembersPointsAPIView.as_view(), name='all-members-points'),
    path('api/save-volunteer-points/', save_volunteer_points, name='save-volunteer-points'),
    path('upload_csv/', include('upload_csv.urls'), name='upload_csv'),
]


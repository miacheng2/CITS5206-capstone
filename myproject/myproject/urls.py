from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from events.views import (TeamMemberViewSet, EventViewSet, VolunteerPointsViewSet, ChangePasswordView, UpdateProfileView,CreateAdminUserView,RegisterView,GetProfileView,UpdateProfileView, UserViewSet, TeamViewSet, TeamMemberViewSet, EventViewSet, VolunteerPointsViewSet,AllMembersPointsAPIView,LoginView,save_volunteer_points,PromoteLeaderView,addEvent,import_csv,MemberViewSet)
from events import views

router = DefaultRouter()

router.register(r'users', UserViewSet)
router.register(r'teams', TeamViewSet)
router.register(r'team-members', TeamMemberViewSet)
router.register(r'events', EventViewSet)
router.register(r'volunteer-points', VolunteerPointsViewSet)
router.register(r'members', MemberViewSet,basename='member')

urlpatterns = [
    path('api/login/', LoginView.as_view(), name='login'),
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
   
    path('api/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('api/promote-leader/', PromoteLeaderView.as_view(), name='promote_leader'),
    path('api/update-profile/', UpdateProfileView.as_view(), name='update-profile'),
    path('api/create-admin/', CreateAdminUserView.as_view(), name='create-admin'),
   
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/get-profile/', GetProfileView.as_view(), name='get-profile'),
    path('api/members-points-all/', AllMembersPointsAPIView.as_view(), name='all-members-points'),
    path('api/save-volunteer-points/', save_volunteer_points, name='save-volunteer-points'),
    #path('api/team-members/', views.TeamMemberListView.as_view(), name='team-members'),

   

    path('api/import-csv/', import_csv, name='import_csv'), 
    path('api/add-event/', addEvent, name='add-event'),
]


from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.authtoken.views import obtain_auth_token
from events.views import (TeamMemberViewSet, EventViewSet, ChangePasswordView, UpdateProfileView,CreateAdminUserView,RegisterView,GetProfileView,UpdateProfileView, UserViewSet, TeamViewSet, TeamMemberViewSet, EventViewSet, VolunteerPointsViewSet,AllMembersPointsAPIView,LoginView,
                          PromoteLeaderView, import_csv,create_team,get_team_leaders,team_with_members,add_member_to_team,delete_team,delete_multiple_teams,
                          DetailedTeamViewSet, DetailedTeamMemberViewSet,
                          get_activities_for_event,remove_member_from_team,update_team_members,PasswordResetRequestView,PasswordResetConfirmView,get_user_counts,admin_list
                          )

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'teams', TeamViewSet)
router.register(r'team-members', TeamMemberViewSet)
router.register(r'events', EventViewSet)
router.register(r'volunteer-points', VolunteerPointsViewSet, basename='volunteer-points')
router.register(r'detailed-teams', DetailedTeamViewSet, basename='detailed-team')
router.register(r'detailed-team-members', DetailedTeamMemberViewSet, basename='detailed-team-member')

urlpatterns = [
    path('api/login/', LoginView.as_view(), name='login'),
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/detailed-teams/delete-multiple/', delete_multiple_teams, name='delete-multiple-teams'),
    path('api/teams/<int:pk>/update-members/', update_team_members, name='update_team_members'),
    path('api/password-reset-request/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('api/password-reset-confirm/<uidb64>/<token>/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('api/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('api/promote-leader/', PromoteLeaderView.as_view(), name='promote_leader'),
    path('api/update-profile/', UpdateProfileView.as_view(), name='update-profile'),
    path('api/create-admin/', CreateAdminUserView.as_view(), name='create-admin'),
    path('api/teams/create/', create_team, name='create-team'),
    path('api/teams/<int:team_id>/', delete_team, name='delete-team'),
    path('api/team-leaders/', get_team_leaders, name='get-team-leaders'),
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/get-profile/', GetProfileView.as_view(), name='get-profile'),
    path('api/members-points-all/', AllMembersPointsAPIView.as_view(), name='all-members-points'),
    path('api/teams/<int:pk>/add-member/', add_member_to_team, name='add_member_to_team'),
    path('api/teams/<int:pk>/remove-member/', remove_member_from_team, name='remove_member_from_team'),
    path('api/teams-with-members/', team_with_members, name='team-with-members'),
    path('api/import-csv/', import_csv, name='import_csv'), 
    path('api/events/<int:event_id>/activities/', get_activities_for_event, name='event-activities'),
    path('api/user-counts/', get_user_counts, name='user-counts'),
    path('api/admin-list/', admin_list, name='admin-list'),


]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


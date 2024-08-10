from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'members', views.MemberViewSet)
router.register(r'events', views.EventViewSet)
router.register(r'volunteerlogs', views.VolunteerLogViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

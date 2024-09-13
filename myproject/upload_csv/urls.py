from django.urls import path
from . import views

urlpatterns = [
    path('import_csv/', views.import_csv, name='upload_csv')
]
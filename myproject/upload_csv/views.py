"""
from django.http import HttpResponse
from django.shortcuts import render

 Create your views here.


 def upload_csv(request):
    return HttpResponse("Hello World")
"""
import csv
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import FileSystemStorage
from .models import Member, VolunteerTeam

@csrf_exempt
def import_csv(request):
    if request.method == 'POST' and request.FILES.get('file'):
        file = request.FILES['file']
        fs = FileSystemStorage()
        filename = fs.save(file.name, file)
        file_path = fs.path(filename)

        new_records = 0
        updated_records = 0
        unchanged_records = 0

        try:
            with open(file_path, newline='') as csvfile:
                reader = csv.DictReader(csvfile)
                for row in reader:
                    asn = row['Australian Sailing Number']
                    member, created = Member.objects.get_or_create(australian_sailing_number=asn)
                    
                    if created:
                        # New record created, count as new record
                        new_records += 1
                        # For new members, assign volunteer teams if provided in the CSV
                        volunteer_team_names = row['Which volunteer team do you wish to join?'].split(',')
                        for team_name in volunteer_team_names:
                            team_name = team_name.strip()
                            if team_name:
                                team, _ = VolunteerTeam.objects.get_or_create(name=team_name)
                                member.volunteer_teams.add(team)
                    else:
                        # For existing members, only update other fields, but NOT the volunteer teams
                        if (
                            member.first_name == row['First name'] and
                            member.last_name == row['Last name'] and
                            member.mobile == row['Mobile'] and
                            member.email_address == row['Email address'] and
                            member.payment_status == row['Payment status'] and
                            member.volunteer_levy == row['Will you be volunteering or pay the volunteer levy?']
                        ):
                            unchanged_records += 1
                        else:
                            updated_records += 1
                            # Update only the fields other than volunteer_teams
                            member.first_name = row['First name']
                            member.last_name = row['Last name']
                            member.mobile = row['Mobile']
                            member.email_address = row['Email address']
                            member.payment_status = row['Payment status']
                            member.volunteer_levy = row['Will you be volunteering or pay the volunteer levy?']
                        
                    member.save()

            return JsonResponse({
                'status': 'success',
                'new_records': new_records,
                'updated_records': updated_records,
                'unchanged_records': unchanged_records
            })

        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

    return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)
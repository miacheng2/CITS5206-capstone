import os
import csv
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import FileSystemStorage
from django.conf import settings
from .models import Member, VolunteerTeam
from django.utils.timezone import now
from django.core.exceptions import ValidationError

@csrf_exempt
def import_csv(request):
    if request.method == 'POST' and request.FILES.get('file'):
        file = request.FILES['file']

        # Validate file extension
        if not file.name.endswith('.csv'):
            return JsonResponse({'status': 'error', 'message': 'Only CSV files are allowed.'}, status=400)

        fs = FileSystemStorage()
        filename = fs.save(file.name, file)
        file_path = fs.path(filename)

        new_records = 0
        updated_records = 0
        unchanged_records = 0

        try:
            with open(file_path, newline='', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)

                # Validate required columns
                required_columns = ['Australian Sailing Number', 'First name', 'Last name', 'Mobile', 'Email address', 'Payment status', 'Will you be volunteering or pay the volunteer levy?', 'Which volunteer team do you wish to join?']
                for column in required_columns:
                    if column not in reader.fieldnames:
                        raise ValidationError(f"Missing required column: {column}")

                for row in reader:
                    asn = row['Australian Sailing Number'].strip()
                    member, created = Member.objects.get_or_create(australian_sailing_number=asn)

                    if created:
                        new_records += 1
                        volunteer_team_names = row['Which volunteer team do you wish to join?'].split(',')
                        for team_name in volunteer_team_names:
                            team_name = team_name.strip()
                            if team_name:
                                team, _ = VolunteerTeam.objects.get_or_create(name=team_name)
                                member.volunteer_teams.add(team)

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
                        member.first_name = row['First name'].strip()
                        member.last_name = row['Last name'].strip()
                        member.mobile = row['Mobile'].strip()
                        member.email_address = row['Email address'].strip()
                        member.payment_status = row['Payment status'].strip()
                        member.volunteer_levy = row['Will you be volunteering or pay the volunteer levy?'].strip()

                    member.save()

            return JsonResponse({
                'status': 'success',
                'new_records': new_records,
                'updated_records': updated_records,
                'unchanged_records': unchanged_records
            })

        except ValidationError as ve:
            return JsonResponse({'status': 'error', 'message': str(ve)}, status=400)
        except csv.Error as e:
            return JsonResponse({'status': 'error', 'message': f'CSV parsing error: {str(e)}'}, status=400)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': f'An unexpected error occurred: {str(e)}'}, status=400)
        finally:
            # Clean up the uploaded file
            if os.path.exists(file_path):
                os.remove(file_path)

    return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)

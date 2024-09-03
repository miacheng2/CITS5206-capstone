from django.contrib import admin
# from django.urls import path
# from django.shortcuts import render
# from .models import Member, VolunteerTeam
# from django import forms

"""
class CsvImportForm(forms.Form):
    csv_upload = forms.FileField()

class MemberAdmin(admin.ModelAdmin):
    list_display = ('australian_sailing_number', 
                    'first_name',
                    'last_name',
                    'mobile',
                    'email_address',
                    'payment_status',
                    'volunteer_levy')

    def get_urls(self):
        urls = super().get_urls()
        new_urls = [path('upload-csv/', self.upload_csv), ]
        return new_urls + urls
    

    def upload_csv(self, request):

        form = CsvImportForm()
        data = {"form": form}
        return render(request, "admin/csv_upload.html", data)

"""            
# admin.site.register(Member, MemberAdmin)

from django.template.loader import render_to_string
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.urls import reverse
from django.conf import settings


def send_password_reset_email(user, request):
    token_generator = PasswordResetTokenGenerator()
    token = token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    
    # Updated reset link to point to the frontend
    reset_link = f"http://localhost:3000/password-reset-confirm/{uid}/{token}/"
    
    # Render the HTML email template with the actual data
    email_content = render_to_string('events/password_reset_email.html', {
        'user': user,
        'reset_link': reset_link,
    })

    # Send the email as an HTML message
    send_mail(
        'Password Reset Request',
        '',  # Plain text message, can be left empty if not needed
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
        html_message=email_content,  # This ensures the email is sent as HTML
    )
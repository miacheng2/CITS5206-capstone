FROM python:3.10.15-bullseye

WORKDIR /app

COPY . .

RUN pip install -r requirements.txt && pip install gunicorn

RUN python manage.py collectstatic --noinput

RUN python manage.py makemigrations && python manage.py migrate

CMD ["gunicorn", "myproject.wsgi", "--bind", "0.0.0.0:8000"]

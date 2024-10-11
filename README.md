# CITS5206 Group Project -- Group Number-17 -- Project 4 -- NYC Volunteer Management System

## Group Member Information Table

| UWA ID   | Student name    | Github user name | work allocated
|----------|-----------------|------------------|-----------------------------------------------------------------
| 23927347 | Nanxi Rao       |  flappyfishhh    |Back-end of Member Management,Work Team Management,User Management
| 23740033 | Zhengyuan Zhang | Ivy(Zhengyuan)   |Both back-end and front-end of Event,Volunteer Point Management,Reporting
| 24061397 | Xia Cheng       |   miacheng2      |Front-end of Member Management,Work Team Management,User Management
| 23813666 | Brandon Ge      |    brand         |Back-end of Member Management,Work Team Management,User Management
| 23806063 | Yuxiao Shi      |   Rita2023       |Front-end of Event,Volunteer Point Management,Reporting
| 23804552 | Ninu Latheesh   |    Ninu1         |Front-end of Event,Volunteer Point Management,Reporting

## Overview

The Nedland Yacht Club (NYC) Volunteer Management System is designed to streamline the management of volunteers across various activities and events. This system facilitates the management of user roles, team coordination, activity scheduling, and points management, enhancing the efficiency and effectiveness of volunteer administration.

## System Roles

### Administrator

- **Responsibilities**:
  - Create and edit user, member, and team information.
  - Import and export CSV files.
  - Manage and audit volunteer points.
  - Generate and view various reports.

### Team Leader

- **Responsibilities**:
  - Add and remove team members.
  - Edit team member information.
  - Export team member data.

## Functional Modules

### User Management

- Administrators can create and edit users.
- Users can edit their personal information and change passwords.

### Member Management

- Administrators can import member data via CSV files.
- Administrators and team leader can create, edit and delet members.
- Synchronization of member information through background tasks.

### Team Management

- Manage team memberships and edit team details.
- Administrators can view the list of team members and their details. 
- Export detailed information about team members in CSV format.

### Activity Management

- Creation, modification, and publishing of volunteer activities.
- Detailed activity information management including name, time, location, and description.

### Points Management

- Automatic calculation of points based on activity participation，including on-water and off-water activities.
- Administrators can view, edit, and audit point allocations.

### Report Generation

- Annual and regular reports on volunteer information and points.
- Detailed scoring statistics and historical data comparisons.

## Technical Implementation

### Frontend

- **Technology**: React
- **Features**: Component-based UI, CSS Modules or Styled Components for styling.

### Backend

- **Framework**: Django
- Provides a robust backend solution for complex web applications.

## Data Model(This part need to be updated after we get the volunteer form template.)

### Users

- Fields: ID, Username, Password, Email, Role

### Members

- Fields: australian_sailing_number, first_name, last_name, mobile, email_address, payment_status, volunteer_levy_status, volunteer_teams

### Teams

- Fields: ID, Team Name, Team Description, Creation Date

### Event

- Fields: ID, Event Name, Event Type, Event date, Create By

### Volunteer Points

- Fields: ID, Member ID, Event ID, Points Awarded, Volunteer hours, Awarded by

## Getting Started

To set up the NYC Volunteer Management System locally:

```bash
# Step 1:Clone the repository
git clone https://github.com/miacheng2/CITS5206-capstone.git

# Step 2:Navigate to the project directory
cd CITS5206-capstone/

# Step 3:Create a virtual environment in the project directory
python -m venv venv

# Step 4: Install Python Dependencies
pip install -r requirements.txt

# Step 5: Apply Database Migrations and Load Sample Data
cd myproject
python manage.py migrate
python manage.py loaddata sample_data.json

# Step 5:Run the backend/ Navigate to myproject directory
python manage.py runserver

# Step 6:Run the frontend/open second terminal and Navigate to the Front_end/ directory.
cd Front_end
npm install
npm start

```
## Architecture of the application

```
CITS5206-capstone/
├── Front_end/
│   ├── node_modules/              # Node.js packages
│   ├── public/                    # Static files
│   │   ├── pic/                   # Directory for images
│   │   ├── favicon.ico            # Website favicon
│   │   ├── index.html             # Main entry HTML file
│   │   ├── logo192.png            # Small logo image
│   │   ├── logo512.png            # Large logo image
│   │   ├── manifest.json          # Application manifest file
│   │   └── robots.txt             # Robots.txt for web crawlers
│   └── src/                       # Source code files
│       ├── assets/
│       │   └── fonts/             # Fonts directory
│       ├── components/            # React components
│       ├── api.js                 # API utility functions
│       ├── App.css                # App global styles
│       ├── App.js                 # Main React component
│       ├── App.test.js            # Tests for the App component
│       ├── EventForm.js           # Event form component
│       ├── index.css              # Index styling
│       ├── index.js               # Entry point for React application
│       ├── logo.svg               # Logo SVG file
│       ├── reportWebVitals.js     # Performance measuring tools
│       └── setupTests.js          # Setup tests utilities
├── myproject/
│   ├── events/
│   │   ├── migrations/            # Migration files for database changes
│   │   ├── __init__.py            # Makes Python treat the directories as containing packages
│   │   ├── admin.py               # Admin panel configurations
│   │   ├── apps.py                # Application-specific configurations
│   │   ├── models.py              # Database models
│   │   ├── serializers.py         # Convert data to and from JSON
│   │   ├── tests.py               # Test cases for the app
│   │   └── views.py               # Handles requests and returns responses
│   ├── myproject/
│   │   ├── __init__.py            # Makes Python treat the directories as containing packages
│   │   ├── asgi.py                # ASGI config for running your project
│   │   ├── settings.py            # Settings/configuration for this Django project
│   │   ├── urls.py                # The URL declarations for this Django project
│   │   └── wsgi.py                # WSGI config for running your project
│   ├── db.sqlite3                 # SQLite database file
│   └── manage.py                  # Command-line utility that lets you interact with this Django project
├── venv/                          # Python virtual environment
├── .gitignore                     # Specifies intentionally untracked files to ignore
├── package-lock.json              # Locked versions of each package
├── package.json                   # Project metadata and dependencies
└── README.md                      # Project README file
```

## Deploying the App on Windows 11

### Prerequisites
- WSL version 1.1.3.0 or later
- Docker Desktop for Windows installed

### Steps
1. **Build the docker Containers**

    ```bash
    docker-compose build
    ```

2. **Start the Containers**

    ```bash
    docker-compose up
    ```

3. **Access the Services**

   Django Backend: Open a browser and navigate to [http://localhost:8000](http://localhost:8000)
   
   React Frontend: Open [http://localhost:3000](http://localhost:3000)

4. **Stop the Services**

    ```bash
    docker-compose down
    ```

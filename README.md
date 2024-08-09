# CITS5206 Group Project -- NYC Volunteer Management System

## Group Member Information Table

| UWA ID   | Student name    | Github user name | work allocated
|----------|-----------------|------------------|-----------------------------------------------------------------
| 23927347 | Nanxi Rao       |  flappyfishhh    |Back-end of Member Management,Work Team Management,User Management
| 23740033 | Zhengyuan Zhang | Ivy(Zhengyuan)   |Both back-end and front-end of Event,Volunteer Point Management,Reporting
| 24061397 | Xia Cheng       |   miacheng2      |Front-end of Member Management,Work Team Management,User Management
| 23813666 | Brandon Ge      |    brand         |Back-end of Member Management,Work Team Management,User Management
| 23806063 | Yuxiao Shi      |   Rita2023       |Both back-end and front-end of Event,Volunteer Point Management,Reporting
| 23804552 | Ninu Latheesh   |    Ninu1         |Both back-end and front-end of Event,Volunteer Point Management,Reporting

## Overview

The NYC Volunteer Management System is designed to streamline the management of volunteers across various activities and events. This system facilitates the management of user roles, team coordination, activity scheduling, and points management, enhancing the efficiency and effectiveness of volunteer administration.

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

- Fields: ID, User ID, Member Type, Join Date

### Teams

- Fields: ID, Team Name, Team Description, Creation Date

### Activities

- Fields: ID, Activity Name, Description, Location, Time

### Points

- Fields: ID, User ID, Activity ID, Points Awarded, Date Awarded

## Getting Started

To set up the NYC Volunteer Management System locally:

```bash
# Clone the repository
git clone https://github.com/miacheng2/CITS5206-capstone.git

# Navigate to the project directory
cd CITS5206-capstone/

# Install dependencies
npm install

# Run the application
npm start

# Run the backend
python manage.py runserver
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

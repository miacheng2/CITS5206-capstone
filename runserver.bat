@echo off
:: Start Docker Desktop
echo Starting Docker Desktop...
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"

:: Wait for Docker Desktop to be fully operational
echo Waiting for Docker Desktop to start...
:waitDocker
timeout /t 10 /nobreak >nul
docker info >nul 2>&1
if errorlevel 1 (
    echo Docker is not ready yet, waiting...
    goto waitDocker
)

:: Run docker-compose up -d
echo Running docker-compose up -d...
docker-compose up -d

:: Wait for any key press to shut down services
echo.
echo Services are running, press any key to stop them...
pause >nul

:: Run docker-compose down
echo Stopping services...
docker-compose down

echo Exiting script...
exit

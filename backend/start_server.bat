@echo off
echo Starting FlexiFi Budget API Server...
echo.

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Start the server
python run_server.py

pause

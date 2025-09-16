@echo off
echo Cleaning database and starting server...
echo.

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Remove database files
del flexifi.db 2>nul
del flexifi.db-journal 2>nul
del flexifi.db-wal 2>nul
del flexifi.db-shm 2>nul

echo Database files cleaned.
echo.

REM Start the server
python run_server.py

pause

@echo off
cd /d "%~dp0backend"
echo ========================================================
echo Starting CattleSense FastAPI Backend on http://localhost:8000
echo ========================================================
call .\.venv\Scripts\activate.bat
python main.py
pause

@echo off
cd backend
echo Starting CattleSense Backend on Port 8000...
call .\.venv\Scripts\activate
python main.py
pause

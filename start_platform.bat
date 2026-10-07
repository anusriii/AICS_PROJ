@echo off
echo ===================================================
echo Starting AI Mock Interview Platform
echo ===================================================

cd /d "%~dp0"

echo [1/2] Starting Backend Server on http://localhost:8000...
start "AI Mock Interview Backend (Port 8000)" cmd /k "cd /d %~dp0backend && .\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000"

timeout /t 2 >nul

echo [2/2] Starting Frontend Client on http://localhost:3000...
start "AI Mock Interview Frontend (Port 3000)" cmd /k "cd /d %~dp0frontend && npm.cmd run dev"

echo.
echo ===================================================
echo Platform is booting up!
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:8000/docs
echo   Demo User: aarav.sharma@example.com / secret123
echo ===================================================

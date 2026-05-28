@echo off
title Shore Stay — Starting...

:: Kill any leftover node processes on dev ports
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":4173 \|:4174 \|:4175 \|:4176 \|:5000 " 2^>nul') do (
    taskkill /PID %%a /F >nul 2>&1
)
timeout /t 1 /nobreak >nul

echo Starting Shore Stay servers...

:: Start backend
start "Shore Stay — Backend :5000" cmd /k "cd /d "%~dp0backend" && npm run dev"

:: Wait then start frontend
timeout /t 4 /nobreak >nul
start "Shore Stay — Frontend :5173" cmd /k "cd /d "%~dp0frontend" && npm run dev"

:: Wait for Vite to compile
timeout /t 8 /nobreak >nul

:: Open browser
start "" "http://localhost:5173"

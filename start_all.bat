@echo off
echo Starting Backend in a new window...
start cmd /k ".\run.bat"

echo Starting Frontend...
cd frontend
npm run dev

@echo off
echo "Starting Business Management & Task Tracking System API..."
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload

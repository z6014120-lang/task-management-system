#!/bin/bash
echo "Starting Business Management & Task Tracking System API..."
source venv/Scripts/activate
uvicorn app.main:app --reload

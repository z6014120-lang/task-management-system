#!/bin/bash
echo "Starting Backend in the background..."
./run.sh &

echo "Starting Frontend..."
cd frontend
npm run dev

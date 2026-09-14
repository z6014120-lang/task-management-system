@echo off
echo Setting up virtual environment and installing dependencies...
C:\Users\DELL\anaconda3\python.exe -m venv venv
.\venv\Scripts\python.exe -m pip install -r requirements.txt
echo Setup complete. You can now run the project using run.bat

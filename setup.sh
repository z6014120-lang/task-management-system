#!/bin/bash
echo "Setting up virtual environment and installing dependencies..."
python -m venv venv
source venv/Scripts/activate
pip install -r requirements.txt
echo "Setup complete. You can now run the project using ./run.sh"

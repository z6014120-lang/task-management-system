# Business Management & Task Tracking System

This is a professional Python-based application developed using FastAPI to manage projects, tasks, team members, and basic activity reporting information. It also includes a fully functional **React (Vite)** frontend!

## Architecture

The project is built using:
- **FastAPI**: Backend REST API.
- **SQLAlchemy & SQLite**: Relational database storage.
- **React.js & Vite**: Fast, modern frontend framework.
- **Axios**: Handling API requests from frontend to backend.

## 1. Backend Setup (FastAPI)

To run the backend API server:

### Option A: Using the provided scripts (Windows)
1. Run `./setup.sh` (in Git Bash) or `setup.bat` (in Command Prompt) to install dependencies.
2. Run `./run.sh` or `run.bat` to start the server.

### Option B: Manual Setup
1. Create a virtual environment:
```bash
python -m venv venv
source venv/Scripts/activate
```
2. Install dependencies:
```bash
pip install -r requirements.txt
```
3. Run the backend application:
```bash
uvicorn app.main:app --reload
```
The API documentation is available at `http://127.0.0.1:8000/docs`.

## 2. Frontend Setup (React & Vite)

To run the frontend website:

1. Open a new terminal (like Git Bash) and navigate to the `frontend` folder:
```bash
cd frontend
```
2. Install the Node modules:
```bash
npm install
```
3. Start the development server:
```bash
npm run dev
```
4. Open the displayed local URL (usually `http://localhost:5173`) in your browser. 
The React app has a proxy configured so that any calls to `/api` are automatically forwarded to your FastAPI backend at `http://127.0.0.1:8000`.

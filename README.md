# 🚀 Task Management System

A full-stack, enterprise-grade Task Management System built to efficiently track projects, assign tasks to employees, and monitor progress through interactive analytics. 

## ✨ Key Features
- **Role-Based Access Control (RBAC):** Distinct dashboards and permissions for Admins and Employees.
- **Interactive Analytics:** Real-time Pie and Bar charts (powered by Recharts) to track task statuses and employee performance.
- **Task Discussions:** Dedicated comment sections on each task for seamless communication between admin and employees.
- **Live Notification System:** Bell icon alerts with real-time badges notifying users of new comments.
- **Modern Minimalist UI:** Accordion-style task lists, dynamic status colors, and a clean interface.

## 🛠️ Tech Stack
- **Frontend:** React.js, Vite, Axios, Recharts
- **Backend:** Python, FastAPI, SQLAlchemy, SQLite
- **Authentication:** JWT (JSON Web Tokens)

## ⚙️ How to Run Locally

### 1. Backend Setup
1. Open a terminal in the root directory.
2. Activate the virtual environment:
   `ash
   .\venv\Scripts\activate
   `
3. Run the backend server:
   `ash
   .\run.bat
   `
   *(Server will start on http://127.0.0.1:8000)*

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend folder:
   `ash
   cd frontend
   `
2. Install the required packages:
   `ash
   npm install
   `
3. Start the development server:
   `ash
   npm run dev
   `
4. Open the link provided in the terminal (usually http://localhost:5173) in your browser.

## 🔐 Demo Credentials
- **Admin:** Username: dmin | Password: dmin123
- **Employee 1:** Username: li_employee | Password: li123
- **Employee 2:** Username: zoya | Password: zoya123

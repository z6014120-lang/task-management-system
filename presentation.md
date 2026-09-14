# Business Management & Task Tracking System
**Advanced Python Internship Task Presentation**

---

## 1. Problem Analysis & Requirements
**Objective**: Build a real-world task management tool for a small company.
**Key Requirements**:
- User authentication and role management
- Project and Task CRUD operations
- Relational data model
- Dashboard analytics
- Testing and documentation

---

## 2. Technology Selection
**Framework: FastAPI**
- Why? It is highly performant, uses standard Python type hints for validation (via Pydantic), and automatically generates interactive API docs (Swagger UI).
**Database: SQLite with SQLAlchemy**
- Why? SQLite provides zero-configuration for development, while SQLAlchemy ORM allows for an easy transition to PostgreSQL/MySQL in production.

---

## 3. Application Architecture
**Clean & Modular Design**
- Modules: `models` (DB), `schemas` (Validation), `routers` (Endpoints)
- Services: `auth.py` for JWT, `dependencies.py` for injected contexts.
- Separation of concerns: Endpoints are unaware of database logic complexity; they rely on SQLAlchemy sessions and Pydantic validation.

---

## 4. Database Design
- **Users**: Manage authentication and relations.
- **Projects**: Core logical grouping of tasks.
- **Tasks**: Contains detailed metadata (priority, status, due date) and relations to Projects and Assignees.
- **Comments**: Tracks activity and discussions on tasks.

*(Refer to docs/database_schema.md for the ER Diagram)*

---

## 5. API Development & Features
- **Authentication**: JWT token-based authentication. Passwords hashed via bcrypt.
- **Filtering & Pagination**: Fetching tasks allows filtering by `project_id`, `status`, `priority` and offers pagination (`skip`, `limit`).
- **Validation**: Strict server-side validation using Pydantic. Meaningful HTTP error codes (e.g., 404 for missing items, 403 for permissions).

---

## 6. Testing & Reliability
- Implemented unit and integration tests using `pytest` and `fastapi.testclient`.
- Used an isolated in-memory or separate testing SQLite database to avoid polluting development data.
- Covers authentication flow, creation, and retrieval.

---

## 7. Next Steps & Future Enhancements
- Switch to PostgreSQL for production.
- Add background workers (e.g., Celery) for email notifications on task assignment.
- Containerize the application using Docker for easier deployment.

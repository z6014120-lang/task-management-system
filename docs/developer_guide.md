# Developer Guide

## Project Structure
The application is structured into the following directories:
- `app/`: Contains the main application code.
  - `models/`: SQLAlchemy models (Database schema).
  - `schemas/`: Pydantic models (Data validation and serialization).
  - `routers/`: API endpoints grouped by resource (e.g., users, projects).
  - `database.py`: Database connection and session management.
  - `dependencies.py`: Dependency injection providers for FastAPI.
  - `auth.py`: JWT authentication utilities and password hashing.
  - `config.py`: Environment variable management.
- `tests/`: Contains pytest test files.
- `docs/`: Contains documentation files.

## Running Tests
Tests are located in the `tests/` directory and use the `pytest` framework with a separate testing SQLite database.
To run tests, execute:
```bash
pytest
```

## Adding New Features
1. **Model**: Add a new database model in `app/models/`.
2. **Schema**: Create corresponding Pydantic schemas in `app/schemas/` for Request and Response validation.
3. **Router**: Create a new API router in `app/routers/` to define the endpoints.
4. **Integration**: Include the new router in `app/main.py`.
5. **Tests**: Add unit and integration tests in `tests/`.

## Configuration and Security Notes
- Passwords are hashed using bcrypt.
- JWT tokens are used for authentication.
- Secrets and configurations should be managed using environment variables (e.g., an `.env` file), mapped via `app.config.Settings`. Make sure `SECRET_KEY` is securely generated in a production environment.

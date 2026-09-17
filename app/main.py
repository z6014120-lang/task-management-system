from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .models import comment, notification
from .routers import auth_router, users_router, projects_router, tasks_router, comments_router, dashboard_router
from .routers.notifications import router as notifications_router
from .config import settings

try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Warning during DB creation: {e}")

app = FastAPI(title=settings.PROJECT_NAME)

# Allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(projects_router)
app.include_router(tasks_router)
app.include_router(comments_router)
app.include_router(dashboard_router)
app.include_router(notifications_router)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def root():
    return {"message": "Welcome to the Business Management & Task Tracking System API"}

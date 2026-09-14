from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import models, dependencies, database

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)

@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_active_user)):
    total_projects = db.query(models.Project).count()
    total_tasks = db.query(models.Task).count()
    tasks_by_status = db.query(models.Task.status, func.count(models.Task.id)).group_by(models.Task.status).all()
    tasks_by_priority = db.query(models.Task.priority, func.count(models.Task.id)).group_by(models.Task.priority).all()

    return {
        "total_projects": total_projects,
        "total_tasks": total_tasks,
        "tasks_by_status": dict(tasks_by_status),
        "tasks_by_priority": dict(tasks_by_priority)
    }

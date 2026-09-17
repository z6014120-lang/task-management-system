from pydantic import BaseModel
from datetime import datetime, date
from .user import User

class TaskBase(BaseModel):
    title: str
    description: str | None = None
    status: str = "todo"
    priority: str = "medium"
    due_date: date | None = None
    attachment_url: str | None = None

class TaskCreate(TaskBase):
    project_id: int
    assignee_id: int | None = None

class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: str | None = None
    priority: str | None = None
    due_date: date | None = None
    assignee_id: int | None = None

class Task(TaskBase):
    id: int
    project_id: int
    assignee_id: int | None = None
    created_at: datetime

    class Config:
        from_attributes = True

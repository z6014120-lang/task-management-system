from pydantic import BaseModel
from datetime import datetime
from .user import User

class ProjectBase(BaseModel):
    name: str
    description: str | None = None
    status: str = "active"

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    status: str | None = None

class Project(ProjectBase):
    id: int
    owner_id: int
    created_at: datetime

    class Config:
        from_attributes = True

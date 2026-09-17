from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from typing import List, Optional
from sqlalchemy.orm import Session
from .. import models, schemas, dependencies, database

router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"]
)

@router.post("/", response_model=schemas.Task, status_code=status.HTTP_201_CREATED)
def create_task(task: schemas.TaskCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_active_user)):
    db_project = db.query(models.Project).filter(models.Project.id == task.project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")

    db_task = models.Task(**task.model_dump())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.get("/", response_model=List[schemas.Task])
def read_tasks(skip: int = 0, limit: int = 100, project_id: Optional[int] = None, assignee_id: Optional[int] = None, status: Optional[str] = None, priority: Optional[str] = None, db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_active_user)):
    query = db.query(models.Task)
    
    # ROLE-BASED ACCESS CONTROL
    if current_user.role != 'admin':
        # Employees can only see tasks assigned to them
        query = query.filter(models.Task.assignee_id == current_user.id)
    else:
        # Admin can filter by assignee_id if provided
        if assignee_id:
            query = query.filter(models.Task.assignee_id == assignee_id)

    if project_id:
        query = query.filter(models.Task.project_id == project_id)
    if status:
        query = query.filter(models.Task.status == status)
    if priority:
        query = query.filter(models.Task.priority == priority)

    tasks = query.offset(skip).limit(limit).all()
    return tasks

@router.get("/{task_id}", response_model=schemas.Task)
def read_task(task_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_active_user)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task

@router.put("/{task_id}", response_model=schemas.Task)
def update_task(task_id: int, task: schemas.TaskUpdate, db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_active_user)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    update_data = task.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_task, key, value)

    db.commit()
    db.refresh(db_task)
    return db_task

import os
import shutil

@router.post("/{task_id}/upload", response_model=schemas.Task)
def upload_task_attachment(task_id: int, file: UploadFile = File(...), db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_active_user)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    file_location = f"uploads/{task_id}_{file.filename}"
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)
        
    db_task.attachment_url = f"/uploads/{task_id}_{file.filename}"
    db.commit()
    db.refresh(db_task)
    return db_task

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_active_user)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db.delete(db_task)
    db.commit()
    return None

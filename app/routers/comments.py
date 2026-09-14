from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from .. import models, schemas, dependencies, database

router = APIRouter(
    prefix="/comments",
    tags=["Comments"]
)

@router.post("/", response_model=schemas.Comment, status_code=status.HTTP_201_CREATED)
def create_comment(comment: schemas.CommentCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_active_user)):
    db_task = db.query(models.Task).filter(models.Task.id == comment.task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    db_comment = models.Comment(**comment.model_dump(), author_id=current_user.id)
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

@router.get("/task/{task_id}", response_model=List[schemas.Comment])
def read_comments_for_task(task_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_active_user)):
    comments = db.query(models.Comment).filter(models.Comment.task_id == task_id).all()
    return comments

@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(comment_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_active_user)):
    db_comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if db_comment is None:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    if db_comment.author_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    db.delete(db_comment)
    db.commit()
    return None

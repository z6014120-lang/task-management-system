from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.orm import Session
from .. import models, schemas, dependencies, database

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

@router.get("/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(dependencies.get_current_active_user)):
    return current_user

@router.get("/", response_model=List[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_active_user)):
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

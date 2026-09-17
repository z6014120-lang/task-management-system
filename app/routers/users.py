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

from ..auth import get_password_hash
from fastapi import HTTPException

@router.post("/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_active_user)):
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Not authorized to create users")
    
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
        
    hashed_password = get_password_hash(user.password)
    db_user = models.User(username=user.username, email=user.email, hashed_password=hashed_password, role=user.role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/", response_model=List[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_active_user)):
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

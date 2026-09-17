from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.orm import Session
from .. import models, schemas, dependencies, database

router = APIRouter(prefix='/notifications', tags=['Notifications'])

@router.get('/')
def get_notifications(db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_active_user)):
    return db.query(models.notification.Notification).filter(models.notification.Notification.user_id == current_user.id).order_by(models.notification.Notification.created_at.desc()).all()

@router.put('/{notif_id}/read')
def mark_read(notif_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_active_user)):
    notif = db.query(models.notification.Notification).filter(models.notification.Notification.id == notif_id, models.notification.Notification.user_id == current_user.id).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {'status': 'ok'}

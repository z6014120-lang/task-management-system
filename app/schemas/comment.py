from pydantic import BaseModel
from datetime import datetime

class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    task_id: int

class Comment(CommentBase):
    id: int
    task_id: int
    author_id: int
    created_at: datetime

    class Config:
        from_attributes = True

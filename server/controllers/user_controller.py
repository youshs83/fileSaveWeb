from fastapi import HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from models.user import User
from utils.auth import get_password_hash


class UserCreateRequest(BaseModel):
    username: str
    password: str
    display_name: Optional[str] = None


class UserUpdateRequest(BaseModel):
    display_name: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[int] = None


def get_users(db: Session):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [
        {"id": u.id, "username": u.username, "display_name": u.display_name,
         "is_active": u.is_active, "created_at": u.created_at}
        for u in users
    ]


def create_user(req: UserCreateRequest, db: Session):
    existing = db.query(User).filter(User.username == req.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="이미 존재하는 사용자명입니다.")
    user = User(
        username=req.username,
        password=get_password_hash(req.password),
        display_name=req.display_name or req.username
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"id": user.id, "username": user.username, "display_name": user.display_name, "is_active": user.is_active}


def update_user(user_id: int, req: UserUpdateRequest, db: Session):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
    if req.display_name is not None:
        user.display_name = req.display_name
    if req.password is not None:
        user.password = get_password_hash(req.password)
    if req.is_active is not None:
        user.is_active = req.is_active
    db.commit()
    db.refresh(user)
    return {"id": user.id, "username": user.username, "display_name": user.display_name, "is_active": user.is_active}


def delete_user(user_id: int, db: Session):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
    db.delete(user)
    db.commit()
    return {"message": "삭제되었습니다."}

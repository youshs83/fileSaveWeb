from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.database import get_db
from utils.auth import get_current_user
from models.user import User
from controllers.user_controller import (
    get_users, create_user, update_user, delete_user,
    UserCreateRequest, UserUpdateRequest
)

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("")
def list_users(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return get_users(db)


@router.post("")
def create_user_route(req: UserCreateRequest, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return create_user(req, db)


@router.put("/{user_id}")
def update_user_route(user_id: int, req: UserUpdateRequest, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return update_user(user_id, req, db)


@router.delete("/{user_id}")
def delete_user_route(user_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return delete_user(user_id, db)

from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from models.user import User
from utils.auth import verify_password, get_password_hash, create_access_token


class LoginRequest(BaseModel):
    username: str
    password: str


class RegisterRequest(BaseModel):
    username: str
    password: str
    display_name: str | None = None


def login(req: LoginRequest, db: Session):
    user = db.query(User).filter(User.username == req.username, User.is_active == 1).first()
    if not user or not verify_password(req.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="아이디 또는 비밀번호가 올바르지 않습니다."
        )
    token = create_access_token({"sub": user.username})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "username": user.username, "display_name": user.display_name}
    }


def register(req: RegisterRequest, db: Session):
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
    return {"id": user.id, "username": user.username, "display_name": user.display_name}

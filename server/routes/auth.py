from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.database import get_db
from controllers.auth_controller import login, register, LoginRequest, RegisterRequest

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login")
def login_route(req: LoginRequest, db: Session = Depends(get_db)):
    return login(req, db)


@router.post("/register")
def register_route(req: RegisterRequest, db: Session = Depends(get_db)):
    return register(req, db)

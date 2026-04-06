from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.database import get_db
from utils.auth import get_current_user
from models.user import User
from controllers.setting_controller import get_settings, update_setting, SettingUpdateRequest

router = APIRouter(prefix="/api/settings", tags=["settings"])


@router.get("")
def list_settings(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return get_settings(db)


@router.put("/{key}")
def update(key: str, req: SettingUpdateRequest, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return update_setting(key, req, db)

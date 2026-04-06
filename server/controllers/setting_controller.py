from sqlalchemy.orm import Session
from pydantic import BaseModel
from models.setting import Setting


class SettingUpdateRequest(BaseModel):
    setting_value: str


def get_settings(db: Session):
    settings = db.query(Setting).all()
    return {s.setting_key: {"value": s.setting_value, "description": s.description} for s in settings}


def update_setting(key: str, req: SettingUpdateRequest, db: Session):
    setting = db.query(Setting).filter(Setting.setting_key == key).first()
    if setting:
        setting.setting_value = req.setting_value
    else:
        setting = Setting(setting_key=key, setting_value=req.setting_value)
        db.add(setting)
    db.commit()
    return {"setting_key": key, "setting_value": req.setting_value}

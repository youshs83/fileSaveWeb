import os
import uuid
import shutil
from datetime import datetime
from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session
from typing import Optional
from PIL import Image

from models.file import File
from models.user import User
from models.setting import Setting
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

DEFAULT_UPLOAD_PATH = os.getenv("UPLOAD_BASE_PATH", "uploads")


def _get_upload_path(db: Session) -> str:
    setting = db.query(Setting).filter(Setting.setting_key == "upload_path").first()
    return setting.setting_value if setting and setting.setting_value else DEFAULT_UPLOAD_PATH


def _extract_exif_date(file_path: str) -> Optional[datetime]:
    """JPEG EXIF에서 촬영일자 추출"""
    try:
        with Image.open(file_path) as img:
            exif = img._getexif()
            if exif:
                # 36867: DateTimeOriginal
                date_str = exif.get(36867) or exif.get(306)
                if date_str:
                    return datetime.strptime(date_str, "%Y:%m:%d %H:%M:%S")
    except Exception:
        pass
    return None


def _get_image_dimensions(file_path: str):
    try:
        with Image.open(file_path) as img:
            return img.width, img.height
    except Exception:
        return None, None


async def upload_file(file: UploadFile, folder_path: str, user_id: int, db: Session):
    upload_base = _get_upload_path(db)
    target_dir = os.path.join(upload_base, folder_path.lstrip("/"))
    os.makedirs(target_dir, exist_ok=True)

    ext = os.path.splitext(file.filename)[1].lower()
    stored_name = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(target_dir, stored_name)

    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    file_size = os.path.getsize(file_path)
    capture_date = _extract_exif_date(file_path)
    width, height = _get_image_dimensions(file_path)

    db_file = File(
        user_id=user_id,
        original_name=file.filename,
        stored_name=stored_name,
        file_path=file_path,
        file_size=file_size,
        mime_type=file.content_type,
        capture_date=capture_date,
        folder_path=folder_path or "/",
        width=width,
        height=height,
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)

    return _file_to_dict(db_file)


def get_files(
    db: Session,
    folder_path: Optional[str] = None,
    page: int = 1,
    per_page: int = 20
):
    query = db.query(File).filter(File.is_deleted == 0)
    if folder_path:
        query = query.filter(File.folder_path == folder_path)
    total = query.count()
    files = query.order_by(File.upload_date.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return {
        "total": total,
        "page": page,
        "per_page": per_page,
        "items": [_file_to_dict(f) for f in files]
    }


def get_recent_files(db: Session, count: int = 12):
    setting = db.query(Setting).filter(Setting.setting_key == "preview_count").first()
    limit = int(setting.setting_value) if setting and setting.setting_value else count
    files = db.query(File).filter(File.is_deleted == 0).order_by(File.upload_date.desc()).limit(limit).all()
    return [_file_to_dict(f) for f in files]


def search_files(
    db: Session,
    upload_start: Optional[str] = None,
    upload_end: Optional[str] = None,
    capture_start: Optional[str] = None,
    capture_end: Optional[str] = None,
    user_id: Optional[int] = None,
    filename: Optional[str] = None,
    page: int = 1,
    per_page: int = 20
):
    query = db.query(File).filter(File.is_deleted == 0)

    if upload_start:
        query = query.filter(File.upload_date >= upload_start)
    if upload_end:
        query = query.filter(File.upload_date <= upload_end + " 23:59:59")
    if capture_start:
        query = query.filter(File.capture_date >= capture_start)
    if capture_end:
        query = query.filter(File.capture_date <= capture_end + " 23:59:59")
    if user_id:
        query = query.filter(File.user_id == user_id)
    if filename:
        query = query.filter(File.original_name.like(f"%{filename}%"))

    total = query.count()
    files = query.order_by(File.upload_date.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return {
        "total": total,
        "page": page,
        "per_page": per_page,
        "items": [_file_to_dict(f) for f in files]
    }


def move_file(file_id: int, new_folder: str, db: Session):
    db_file = db.query(File).filter(File.id == file_id, File.is_deleted == 0).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="파일을 찾을 수 없습니다.")

    upload_base = _get_upload_path(db)
    new_dir = os.path.join(upload_base, new_folder.lstrip("/"))
    os.makedirs(new_dir, exist_ok=True)

    new_path = os.path.join(new_dir, db_file.stored_name)
    shutil.move(db_file.file_path, new_path)

    db_file.file_path = new_path
    db_file.folder_path = new_folder
    db.commit()
    return _file_to_dict(db_file)


def delete_file(file_id: int, db: Session):
    db_file = db.query(File).filter(File.id == file_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="파일을 찾을 수 없습니다.")
    db_file.is_deleted = 1
    db.commit()
    return {"message": "삭제되었습니다."}


def get_folders(db: Session):
    rows = db.query(File.folder_path).filter(File.is_deleted == 0).distinct().all()
    return sorted(set(r[0] for r in rows))


def _file_to_dict(f: File) -> dict:
    return {
        "id": f.id,
        "user_id": f.user_id,
        "original_name": f.original_name,
        "stored_name": f.stored_name,
        "file_size": f.file_size,
        "mime_type": f.mime_type,
        "capture_date": f.capture_date.isoformat() if f.capture_date else None,
        "upload_date": f.upload_date.isoformat() if f.upload_date else None,
        "folder_path": f.folder_path,
        "width": f.width,
        "height": f.height,
    }

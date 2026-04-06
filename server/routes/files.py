import os
from fastapi import APIRouter, Depends, UploadFile, File as FastAPIFile, Form, Query
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional
from config.database import get_db
from utils.auth import get_current_user, get_current_user_flexible
from models.user import User
from models.file import File
from controllers.file_controller import (
    upload_file, get_files, get_recent_files, search_files,
    move_file, delete_file, get_folders
)

router = APIRouter(prefix="/api/files", tags=["files"])


@router.post("/upload")
async def upload(
    file: UploadFile = FastAPIFile(...),
    folder_path: str = Form(default="/"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await upload_file(file, folder_path, current_user.id, db)


@router.get("")
def list_files(
    folder_path: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    return get_files(db, folder_path, page, per_page)


@router.get("/recent")
def recent_files(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return get_recent_files(db)


@router.get("/search")
def search(
    upload_start: Optional[str] = Query(None),
    upload_end: Optional[str] = Query(None),
    capture_start: Optional[str] = Query(None),
    capture_end: Optional[str] = Query(None),
    user_id: Optional[int] = Query(None),
    filename: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    return search_files(db, upload_start, upload_end, capture_start, capture_end, user_id, filename, page, per_page)


@router.get("/folders")
def folders(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return get_folders(db)


@router.get("/{file_id}/download")
def download(file_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user_flexible)):
    db_file = db.query(File).filter(File.id == file_id, File.is_deleted == 0).first()
    if not db_file or not os.path.exists(db_file.file_path):
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="파일을 찾을 수 없습니다.")
    return FileResponse(db_file.file_path, filename=db_file.original_name)


@router.get("/{file_id}/preview")
def preview(file_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user_flexible)):
    db_file = db.query(File).filter(File.id == file_id, File.is_deleted == 0).first()
    if not db_file or not os.path.exists(db_file.file_path):
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="파일을 찾을 수 없습니다.")
    return FileResponse(db_file.file_path, media_type=db_file.mime_type or "image/jpeg")


class MoveRequest(BaseModel):
    new_folder: str


@router.put("/{file_id}/move")
def move(file_id: int, req: MoveRequest, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return move_file(file_id, req.new_folder, db)


@router.delete("/{file_id}")
def delete(file_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return delete_file(file_id, db)

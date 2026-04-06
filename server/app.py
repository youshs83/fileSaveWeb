import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

from routes.auth import router as auth_router
from routes.users import router as user_router
from routes.files import router as file_router
from routes.settings import router as setting_router

app = FastAPI(title="fileSaveWeb API", version="1.0.0")

# CORS - React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(user_router)
app.include_router(file_router)
app.include_router(setting_router)


@app.get("/api/health")
def health():
    return {"status": "ok"}

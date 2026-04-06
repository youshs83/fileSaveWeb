# Phone Archive — 사진 아카이빙 웹앱

사진을 개인 PC로 업로드하고 날짜별로 관리·검색·미리보기하는 웹 애플리케이션입니다.

## 기술 스택
- **Frontend**: React + Vite + Tailwind CSS v4 + Zustand
- **Backend**: Python FastAPI
- **Database**: MariaDB
- **인증**: JWT

## 빠른 시작

### 1. 데이터베이스 초기화
```bash
mysql -h 192.168.253.27 -u root -p < database/migrations/001_create_tables.sql
mysql -h 192.168.253.27 -u root -p < database/seeds/001_initial_data.sql
```

### 2. 백엔드 실행
```bash
cd server
pip install -r requirements.txt
python server.py
```
- 기본 주소: http://localhost:8000
- Swagger UI: http://localhost:8000/docs

### 3. 프론트엔드 실행
```bash
cd client
npm install
npm run dev
```
- 기본 주소: http://localhost:5173

## 기본 계정
| 아이디 | 비밀번호 |
|--------|----------|
| admin  | admin123 |

> 초기 계정 비밀번호는 `server/server.py` 실행 후 `/api/auth/register` API로 새 계정 생성을 권장합니다.

## 화면 구성
| 경로 | 화면 |
|------|------|
| /login | 로그인 |
| /main | 메인 (업로드 + 미리보기 + 목록) |
| /search | 검색 (날짜/사용자/파일명) |
| /setting | 설정 (사용자 관리 + 업로드 경로) |

## 환경 변수 (server/.env)
```
DB_HOST=192.168.253.27
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=fileSaveWeb
JWT_SECRET=fileSaveWeb_secret_key_2026
UPLOAD_BASE_PATH=D:/bigeye_workspace/fileSaveWeb/uploads
```

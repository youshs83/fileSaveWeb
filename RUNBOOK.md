# fileSaveWeb — 실행 경로 및 운영 가이드

> 최종 검증일: 2026-03-28 | Python 3.13 · bcrypt 5.x · Node.js (Vite 8) · MariaDB 10.10

---

## 1. 환경 요건

| 항목 | 버전 | 비고 |
|------|------|------|
| Python | 3.11 이상 | 3.13 검증 완료 |
| Node.js | 18 이상 | npm 포함 |
| MariaDB | 10.x / MySQL 8.x | 원격(192.168.253.27) 또는 로컬 |
| OS | Windows 10/11 | 경로 구분자 `/` 또는 `\` 모두 지원 |

---

## 2. 최초 설치 (처음 한 번만)

### 2-1. Python 의존성 설치

```bash
cd D:/bigeye_workspace/fileSaveWeb/server
pip install -r requirements.txt
```

### 2-2. Node.js 의존성 설치

```bash
cd D:/bigeye_workspace/fileSaveWeb/client
npm install
```

### 2-3. 데이터베이스 초기화

MariaDB/MySQL 클라이언트가 필요합니다.

```bash
# 테이블 생성
"C:/Program Files/MariaDB 10.10/bin/mysql.exe" -h 192.168.253.27 -u root -proot < D:/bigeye_workspace/fileSaveWeb/database/migrations/001_create_tables.sql

# 초기 데이터 삽입 (admin / admin123)
"C:/Program Files/MariaDB 10.10/bin/mysql.exe" -h 192.168.253.27 -u root -proot fileSaveWeb < D:/bigeye_workspace/fileSaveWeb/database/seeds/001_initial_data.sql
```

> MariaDB 클라이언트 위치가 다르면 `where mysql`로 확인하세요.

### 2-4. 업로드 폴더 생성

```bash
mkdir -p D:/bigeye_workspace/fileSaveWeb/uploads
```

### 2-5. 환경 변수 확인

`server/.env` 파일을 열어 DB 접속 정보와 업로드 경로를 확인합니다:

```env
DB_HOST=192.168.253.27
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=fileSaveWeb

JWT_SECRET=fileSaveWeb_secret_key_2026
JWT_EXPIRE_HOURS=24

HOST=0.0.0.0
PORT=8000

UPLOAD_BASE_PATH=D:/bigeye_workspace/fileSaveWeb/uploads
```

---

## 3. 서버 실행 (매번)

### 터미널 1 — 백엔드 (FastAPI)

```bash
cd D:/bigeye_workspace/fileSaveWeb/server
python server.py
```

또는 uvicorn 직접 실행:

```bash
cd D:/bigeye_workspace/fileSaveWeb/server
python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

정상 기동 시 출력:
```
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

→ API 문서: http://localhost:8000/docs

### 터미널 2 — 프론트엔드 (React + Vite)

```bash
cd D:/bigeye_workspace/fileSaveWeb/client
npm run dev
```

정상 기동 시 출력:
```
VITE v8.x.x  ready in XXX ms
➜  Local:   http://localhost:5173/
```

→ 웹 앱 접속: http://localhost:5173

---

## 4. 기본 계정

| 항목 | 값 |
|------|-----|
| 아이디 | `admin` |
| 비밀번호 | `admin123` |

> 운영 환경에서는 즉시 변경하세요.

---

## 5. API 엔드포인트 목록

| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|------|
| GET | `/api/health` | 서버 상태 확인 | 불필요 |
| POST | `/api/auth/login` | 로그인 | 불필요 |
| POST | `/api/auth/register` | 사용자 등록 | 불필요 |
| GET | `/api/files` | 파일 목록 (페이징) | 필요 |
| GET | `/api/files/recent` | 최근 파일 목록 | 필요 |
| GET | `/api/files/search` | 파일 검색 | 필요 |
| GET | `/api/files/folders` | 폴더 목록 | 필요 |
| POST | `/api/files/upload` | 파일 업로드 | 필요 |
| GET | `/api/files/{id}/preview` | 이미지 미리보기 | 필요* |
| GET | `/api/files/{id}/download` | 파일 다운로드 | 필요* |
| PUT | `/api/files/{id}/move` | 파일 이동 | 필요 |
| DELETE | `/api/files/{id}` | 파일 삭제 | 필요 |
| GET | `/api/users` | 사용자 목록 | 필요 |
| POST | `/api/users` | 사용자 등록 | 필요 |
| PUT | `/api/users/{id}` | 사용자 수정 | 필요 |
| DELETE | `/api/users/{id}` | 사용자 삭제 | 필요 |
| GET | `/api/settings` | 설정 목록 | 필요 |
| PUT | `/api/settings/{key}` | 설정 저장 | 필요 |

> `*` preview/download는 `Authorization: Bearer {token}` 헤더 또는 `?token={token}` 쿼리 파라미터 모두 지원
> (`<img src>`, `<a href>` 태그에서 사용 가능)

---

## 6. API 호출 예시 (curl)

```bash
# 로그인
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | python -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

# 파일 목록 조회
curl -s http://localhost:8000/api/files \
  -H "Authorization: Bearer $TOKEN"

# 최근 파일 조회
curl -s http://localhost:8000/api/files/recent \
  -H "Authorization: Bearer $TOKEN"

# 이미지 미리보기 (Authorization 헤더)
curl -s -o preview.jpg \
  http://localhost:8000/api/files/1/preview \
  -H "Authorization: Bearer $TOKEN"

# 이미지 미리보기 (쿼리 파라미터 — img 태그용)
curl -s -o preview.jpg \
  "http://localhost:8000/api/files/1/preview?token=$TOKEN"

# 설정 조회
curl -s http://localhost:8000/api/settings \
  -H "Authorization: Bearer $TOKEN"
```

---

## 7. 프로덕션 빌드

```bash
# 프론트엔드 빌드 (dist/ 생성)
cd D:/bigeye_workspace/fileSaveWeb/client
npm run build

# 빌드 결과물을 백엔드에서 정적 파일로 서빙
# server/app.py 에 아래 코드 추가 (선택)
# app.mount("/", StaticFiles(directory="../client/dist", html=True), name="static")
```

---

## 8. 디렉토리 구조 (최종)

```
fileSaveWeb/
├── client/                  # Frontend (React 19 + Vite 8 + Tailwind 4)
│   ├── src/
│   │   ├── components/layout/   # Header, Layout
│   │   ├── pages/               # LoginPage, MainPage, SearchPage, SettingPage
│   │   ├── services/api.js      # Axios 클라이언트 (JWT 인터셉터)
│   │   └── store/authStore.js   # Zustand 인증 상태
│   └── vite.config.js           # /api → localhost:8000 프록시 설정
│
├── server/                  # Backend (Python 3.13 + FastAPI)
│   ├── app.py               # FastAPI 앱 + CORS 설정
│   ├── server.py            # Uvicorn 진입점
│   ├── .env                 # 환경 변수 (DB, JWT, 업로드 경로)
│   ├── config/database.py   # SQLAlchemy 엔진/세션
│   ├── models/              # user.py, file.py, setting.py
│   ├── routes/              # auth, users, files, settings 라우터
│   ├── controllers/         # 비즈니스 로직
│   ├── utils/auth.py        # JWT + bcrypt 인증 유틸
│   └── requirements.txt
│
├── database/
│   ├── migrations/001_create_tables.sql
│   └── seeds/001_initial_data.sql
│
├── uploads/                 # 업로드된 파일 저장소 (서버 로컬)
├── DESIGN.md                # 설계 문서
├── RUNBOOK.md               # 본 파일 — 실행 가이드
└── README.md
```

---

## 9. 트러블슈팅

### 로그인 실패 (401)
- DB에 admin 계정이 없는 경우 → seed SQL 재실행
- 비밀번호 해시 불일치 → seed SQL의 해시값 확인 (bcrypt 5.x 생성값 사용)

### 이미지 미리보기 안 됨
- 백엔드가 실행 중인지 확인 (`/api/health` 응답 확인)
- preview/download 엔드포인트는 `?token=...` 쿼리 파라미터 지원 (자동으로 처리됨)

### 파일 업로드 실패
- `server/.env`의 `UPLOAD_BASE_PATH` 경로가 존재하는지 확인
- `uploads/` 폴더 쓰기 권한 확인
- 서버를 반드시 `server/` 디렉토리에서 실행 (`cd D:/bigeye_workspace/fileSaveWeb/server`)

### DB 연결 실패
- MariaDB 서버가 실행 중인지 확인
- `server/.env`의 DB_HOST, DB_USER, DB_PASSWORD 확인
- 방화벽/포트 3306 확인

### bcrypt 오류 (passlib 관련)
- `requirements.txt`에서 `passlib[bcrypt]`가 제거되고 `bcrypt>=4.0.0`으로 교체됨
- 기존에 `passlib`가 설치된 경우: `pip uninstall passlib -y`

---

## 10. 변경 이력 (리팩토링 내역)

| 날짜 | 변경 항목 | 이유 |
|------|-----------|------|
| 2026-03-28 | `passlib` → `bcrypt` 직접 사용 전환 | bcrypt 5.x와 passlib 비호환 버그 |
| 2026-03-28 | preview/download 엔드포인트 `?token=` 쿼리 파라미터 지원 추가 | `<img src>` 태그는 Authorization 헤더 전송 불가 |
| 2026-03-28 | `MainPage.jsx` 다운로드 링크 토큰 추가 | 인증 없이 다운로드 실패 버그 |
| 2026-03-28 | `SearchPage.jsx` 미리보기/다운로드에 토큰 추가 | 동일 이슈 |
| 2026-03-28 | `file_controller.py` 미사용 `import struct` 제거 | 코드 정리 |
| 2026-03-28 | `app.py` 미사용 `StaticFiles` import 제거 | 코드 정리 |
| 2026-03-28 | `database/seeds/001_initial_data.sql` 해시 수정 | bcrypt 5.x 기준 올바른 해시값 |

---
name: tdd-web-loop
description: looptest.md 기반 웹 프로젝트를 TDD 방식으로 자동 개발하는 루프 스킬
user_invocable: true
---

## 목적
looptest.md의 요구사항을 읽고, 기능 단위로 분해하여
테스트 작성 → 코드 구현 → 검증 → (실패 시 수정 반복) 루프를 자동 수행한다.

## 실행 절차

### Step 0: 환경 준비
1. looptest.md 읽어서 요구사항 파악
2. 의존성 설치 (pip install, npm install)
3. DB 연결 확인 (docker ps)
4. 기능 목록을 태스크로 분해

### Step 1: 백엔드 루프 (기능별 반복)
각 기능에 대해:
1. server/tests/에 실패하는 테스트 작성
2. `cd server && python -m pytest` 실행 → 실패 확인 (Red)
3. server/ 하위에 최소 코드 구현 (routes/, controllers/ 등)
4. pytest 재실행
5. 실패 → 에러 분석 → 코드 수정 → 4번 반복 (최대 5회)
6. 성공 → 다음 기능으로

기능 순서:
- DB 연결 (server/config/database.py)
- 로그인 API (server/routes/auth.py)
- 파일 업로드 API (server/routes/files.py)

### Step 2: 프론트엔드 루프 (화면별 반복)
각 화면에 대해:
1. client/src/__tests__/에 실패하는 테스트 작성
2. `cd client && npx vitest` 실행 → 실패 확인 (Red)
3. client/src/pages/ 또는 client/src/components/에 컴포넌트 구현
4. vitest 재실행
5. 실패 → 에러 분석 → 코드 수정 → 4번 반복 (최대 5회)
6. 성공 → 다음 화면으로

화면 순서:
- 로그인 화면 (client/src/pages/LoginPage.jsx)
- 메인 화면 (client/src/pages/MainPage.jsx)

### Step 3: 통합 검증
1. 백엔드 서버 기동
2. 프론트엔드 빌드 확인
3. API 연동 테스트 (curl)
4. 실패 → 원인 분석 → 수정 → 반복

### Step 4: 결과 보고
- 구현된 기능 목록
- 테스트 통과 현황
- 남은 이슈 (있다면)

## 규칙
- 한 번에 하나의 기능만 구현한다
- 사용자에게 질문하지 않는다. 모호한 경우 최선의 판단으로 결정하고 진행한다
- 파일/디렉토리가 없으면 직접 생성하고 진행한다
- 선택이 필요한 경우 일반적인 관행(PEP8, REST 표준 등)을 따른다
- 테스트 실패 시 최대 5회 재시도 후 사용자에게 보고한다
- .env 파일은 생성하되 커밋하지 않는다
- 각 사이클마다 logs/loop-activity.log에 진행 상황 기록

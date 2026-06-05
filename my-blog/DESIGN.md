# 📝 Project Design Document: My Blog

## 1. 프로젝트 개요

- 목적: Vite + React 기반의 개인 포트폴리오 블로그
- 주요 기능
  - 메인화면: 게시글 실시간 목록 조회(Supabase), 상세 보기, 카테고리(태그) 필터링, 게시글 스택형 레이아웃
  - 블로그 작성페이지: 내용을 작성하고 Supabase DB에 저장
  - 라우팅: 메인 화면과 작성 페이지 간의 전환 기능 (`react-router-dom` 활용)

## 2. 기술 스택 (Tech Stack)

- Frontend: React (Vite), Tailwind CSS (스타일링), React Router DOM
- Backend/DB: Supabase
- State Management: React Context API 또는 useState

## 3. 데이터베이스 데이터 모델 (Database Schema)

### `posts` 테이블

- `id` (int8, PK, Auto Increment)
- `title` (text, Not Null)
- `content` (text, Not Null)
- `tag` (text, Nullable)
- `created_at` (timestamptz, 기본값 now())

## 4. 컴포넌트 구조 및 파일 레이아웃

- `src/main.jsx`: 엔트리 포인트
- `src/App.jsx`: 라우터 설정 및 전체 레이아웃 구심점
- `src/index.css`: Tailwind CSS 기본 설정 파일
- `src/pages/Home.jsx`: 블로그 메인화면 페이지 (목록 및 상세 조회)
- `src/pages/WriteBlog.jsx`: 블로그 작성 페이지
- `src/supabaseClient.js`: Supabase 클라이언트 초기화 설정 파일 (수정 금지)

## 5. 개발 규칙 및 제약사항

- 모든 환경변수는 `.env` 파일의 `VITE_` 접두사를 사용한다.
- Supabase 호출 시 에러 처리는 반드시 `try-catch` 또는 `if (error)` 구문으로 로깅한다.
- `.env.local` 파일은 수정하지 말 것.
- `src/supabaseClient.js` 파일은 수정하지 말 것.

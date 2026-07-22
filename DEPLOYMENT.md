# 🌱 우리아이 꿈 자람 터 - 배포 지침서 (DEPLOYMENT.md)

본 지침서는 ** Next.js + Supabase ** 스택 기반으로 구축된 '우리아이 꿈 자람 터' 플랫폼을 Vercel에 배포하고 Supabase DB와 연동하여 내 아이 및 지인들과 공유하는 전체 절차를 안내합니다.

---

## 1. 사전 준비 사항

- [GitHub 계정](https://github.com) 및 프로젝트 코드 저장소
- [Vercel 계정](https://vercel.com) (무료 계정으로 전 기능 이용 가능)
- [Supabase 계정](https://supabase.com) (무료 계정으로 DB, Auth, Storage 생성)

---

## 2. Supabase 데이터베이스 구축 (DB 마이그레이션)

1. **Supabase 새 프로젝트 생성**
   - Supabase 대시보드에서 `New Project` 클릭 ➔ 프로젝트 이름 설정 (예: `kkum-jaram-db`) 및 데이터베이스 비밀번호 입력.

2. **SQL 마이그레이션 순서대로 실행**
   - Supabase 프로젝트 좌측 메뉴의 **`SQL Editor`** 진입 ➔ `New Query` 클릭 후 프로젝트 내 아래 3개 SQL 파일의 내용을 순서대로 복사해 실행(`Run`)합니다.

   - **Step 1: DB 스키마 생성 (`20260722_init_schema.sql`)**
     - 위치: `supabase/migrations/20260722_init_schema.sql`
     - 계정(`accounts`), 아이 프로필(`children`), 개념(`concepts`), 문항(`questions`), 풀이 기록(`attempts`), 숙달도(`concept_mastery`), 포인트/소원(`wishes`) 테이블 생성.

   - **Step 2: RLS 보안 정책 적용 (`20260722_rls_policies.sql`)**
     - 위치: `supabase/migrations/20260722_rls_policies.sql`
     - 계정별 격리 보안 정책 적용 (문항/개념은 공용, 풀이 기록 및 소원은 계정별 격리).

   - **Step 3: 초등 3학년 수학 시드 데이터 입력 (`20260722_seed_math_grade3.sql`)**
     - 위치: `supabase/migrations/20260722_seed_math_grade3.sql`
     - 10개 수학 개념 및 40개 객관식/단답형 시드 문항 등록.

3. **Supabase API URL 및 Anon Key 확인**
   - `Project Settings` ➔ `API` 메뉴 진입.
   - `Project URL` 과 `anon public` Key 값을 복사합니다.

---

## 3. Vercel 웹앱 단일 배포

1. **Vercel 프로젝트 가져오기**
   - [Vercel Dashboard](https://vercel.com/dashboard) ➔ `Add New` ➔ `Project` 클릭.
   - GitHub 저장소 `kkum-jaram` 선택 후 `Import`.

2. **환경 변수(Environment Variables) 설정**
   - 배포 설정 화면의 `Environment Variables` 항목에 복사한 키를 주입합니다.
     - `NEXT_PUBLIC_SUPABASE_URL`: Supabase Project URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase Anon Key

3. **배포(Deploy) 클릭**
   - `Deploy` 버튼을 누르면 약 1분 이내에 글로벌 라이브 URL(예: `https://kkum-jaram.vercel.app`)이 생성되며 즉시 배포가 완료됩니다!

---

## 4. 지인 공유 및 3분 시작 안내

배포된 링크 하나만 지인에게 전달하면 추가 설치나 환경설정 없이 바로 사용 가능합니다.

1. **링크 접속 및 회원가입**
   - 배포된 웹사이트 링크 접속 후 `부모 회원가입` 진행.
2. **API 키 설정 (BYOK)**
   - `부모 모드` ➔ `BYOK 설정`에서 Anthropic API 키 입력 (Edge Function에서 암호화 보관).
3. **아이 프로필 등록**
   - 아이 별명, 학년(초등 3학년 등), 장래희망 및 첫 소원상자 등록 후 즉시 아이 모드 학습 시작!

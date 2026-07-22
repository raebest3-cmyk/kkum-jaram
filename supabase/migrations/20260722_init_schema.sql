-- ========================================================
-- 우리아이 꿈 자람 터 - DB 마이그레이션 DDL (§7 전체 반영)
-- ========================================================

-- 1. 계정 (Supabase auth.users 연동)
create table if not exists accounts (
 id uuid primary key references auth.users on delete cascade,
 display_name text,
 role text default 'parent',
 created_at timestamptz default now()
);

-- 2. 사용자별 API 키 (BYOK, 암호화 저장; Edge Function만 복호화 접근)
create table if not exists user_secrets (
 account_id uuid primary key references accounts(id) on delete cascade,
 anthropic_key_encrypted text,
 updated_at timestamptz default now()
);

-- 3. 아이 프로필 (계정 종속)
create table if not exists children (
 id uuid primary key default gen_random_uuid(),
 account_id uuid references accounts(id) on delete cascade,
 nickname text not null, -- 실명 대신 별명
 grade smallint not null, -- 1~12 (초1=1 ... 고3=12)
 dream_job text,
 theme text default 'auto',
 created_at timestamptz default now()
);

-- 4. 개념 트리 (공용)
create table if not exists concepts (
 id uuid primary key default gen_random_uuid(),
 code text unique not null,
 subject text not null,
 grade smallint not null,
 name text not null,
 prerequisite_codes text[] default '{}'
);

-- 5. 문항 (공용)
create table if not exists questions (
 id uuid primary key default gen_random_uuid(),
 concept_id uuid references concepts(id) on delete cascade,
 difficulty smallint check (difficulty between 1 and 5),
 qtype text check (qtype in ('mcq','short')),
 body jsonb not null, -- mcq:{stem,choices[]} / short:{stem}
 answer jsonb not null, -- mcq:{correct_index} / short:{value}
 misconception_map jsonb default '{}',
 source text default 'seed:ai-generated+reviewed'
);

-- 6. 풀이 기록 (계정별)
create table if not exists attempts (
 id bigint generated always as identity primary key,
 child_id uuid references children(id) on delete cascade,
 question_id uuid references questions(id) on delete cascade,
 is_correct boolean,
 response jsonb,
 latency_ms int,
 created_at timestamptz default now()
);

-- 7. 개념 숙달도 (계정별)
create table if not exists concept_mastery (
 child_id uuid references children(id) on delete cascade,
 concept_id uuid references concepts(id) on delete cascade,
 mastery numeric default 0, -- 0.0 ~ 1.0
 updated_at timestamptz default now(),
 primary key (child_id, concept_id)
);

-- 8. 간격반복 복습 큐 (계정별)
create table if not exists review_queue (
 child_id uuid references children(id) on delete cascade,
 question_id uuid references questions(id) on delete cascade,
 interval_days int default 1,
 ease numeric default 2.5,
 next_review date,
 primary key (child_id, question_id)
);

-- 9. 포인트 원장 / 소원상자 (계정별)
create table if not exists points_ledger (
 id bigint generated always as identity primary key,
 child_id uuid references children(id) on delete cascade,
 delta int,
 reason text,
 created_at timestamptz default now()
);

create table if not exists wishes (
 id uuid primary key default gen_random_uuid(),
 child_id uuid references children(id) on delete cascade,
 title text,
 target_points int,
 status text default 'active', -- active/achieved
 proof_image_path text,
 achieved_at timestamptz
);

-- 10. 흥미·적성 결과 / 진로 (계정별, P4)
create table if not exists aptitude_results (
 id uuid primary key default gen_random_uuid(),
 child_id uuid references children(id) on delete cascade,
 test_kind text,
 result jsonb,
 taken_at timestamptz default now()
);

create table if not exists career_profiles (
 child_id uuid primary key references children(id) on delete cascade,
 wish_job text,
 strengths jsonb,
 fusion_suggestion jsonb,
 updated_at timestamptz default now()
);

-- 11. AI 대화 로그 (계정별, 보존기간 자동 만료)
create table if not exists ai_sessions (
 id uuid primary key default gen_random_uuid(),
 child_id uuid references children(id) on delete cascade,
 kind text, -- discussion/analysis/career
 transcript jsonb,
 created_at timestamptz default now(),
 expires_at timestamptz
);

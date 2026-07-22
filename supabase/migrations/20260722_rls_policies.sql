-- ========================================================
-- 우리아이 꿈 자람 터 - RLS 보안 정책 (§7 반영)
-- ========================================================

-- RLS 활성화
alter table accounts enable row level security;
alter table user_secrets enable row level security;
alter table children enable row level security;
alter table concepts enable row level security;
alter table questions enable row level security;
alter table attempts enable row level security;
alter table concept_mastery enable row level security;
alter table review_queue enable row level security;
alter table points_ledger enable row level security;
alter table wishes enable row level security;
alter table aptitude_results enable row level security;
alter table career_profiles enable row level security;
alter table ai_sessions enable row level security;

-- 1. 공용 테이블 (concepts, questions): 인증된 모든 사용자 읽기 허용
create policy "공용 개념 읽기 허용" on concepts
  for select using (auth.role() = 'authenticated');

create policy "공용 문항 읽기 허용" on questions
  for select using (auth.role() = 'authenticated');

-- 2. 계정 테이블 (accounts)
create policy "본인 계정 조회/수정" on accounts
  for all using (id = auth.uid());

-- 3. BYOK 사용자 API 키 (user_secrets)
create policy "본인 API 키 관리" on user_secrets
  for all using (account_id = auth.uid());

-- 4. 아이 프로필 (children)
create policy "본인 아이 프로필 관리" on children
  for all using (account_id = auth.uid());

-- 5. 아이 종속 개인 데이터 테이블 (attempts, concept_mastery, review_queue, points_ledger, wishes, aptitude_results, career_profiles, ai_sessions)
create policy "본인 아이 풀이 기록 관리" on attempts
  for all using (child_id in (select id from children where account_id = auth.uid()));

create policy "본인 아이 개념 숙달도 관리" on concept_mastery
  for all using (child_id in (select id from children where account_id = auth.uid()));

create policy "본인 아이 복습 큐 관리" on review_queue
  for all using (child_id in (select id from children where account_id = auth.uid()));

create policy "본인 아이 포인트 원장 관리" on points_ledger
  for all using (child_id in (select id from children where account_id = auth.uid()));

create policy "본인 아이 소원상자 관리" on wishes
  for all using (child_id in (select id from children where account_id = auth.uid()));

create policy "본인 아이 적성 결과 관리" on aptitude_results
  for all using (child_id in (select id from children where account_id = auth.uid()));

create policy "본인 아이 진로 프로필 관리" on career_profiles
  for all using (child_id in (select id from children where account_id = auth.uid()));

create policy "본인 아이 AI 세션 관리" on ai_sessions
  for all using (child_id in (select id from children where account_id = auth.uid()));

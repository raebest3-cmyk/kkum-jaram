-- ========================================================
-- 우리아이 꿈 자람 터 - 초등 3학년 수학 시드 데이터 (§부록 D)
-- ========================================================

-- 1. 개념 트리에 3학년 수학 개념 10개 등록
insert into concepts (code, subject, grade, name, prerequisite_codes) values
('MATH-G3-ADD', '수학', 3, '세 자리 수의 덧셈', '{}'),
('MATH-G3-SUB', '수학', 3, '세 자리 수의 뺄셈', '{"MATH-G3-ADD"}'),
('MATH-G3-MUL', '수학', 3, '곱셈 (두 자리 수 × 한 자리 수)', '{}'),
('MATH-G3-DIV', '수학', 3, '나눗셈 기초', '{"MATH-G3-MUL"}'),
('MATH-G3-FRAC', '수학', 3, '분수와 단위분수', '{}'),
('MATH-G3-FRAC-CMP', '수학', 3, '분수의 크기 비교', '{"MATH-G3-FRAC"}'),
('MATH-G3-DEC', '수학', 3, '소수 한 자리 수', '{"MATH-G3-FRAC"}'),
('MATH-G3-LEN-TIME', '수학', 3, '길이와 시간', '{}'),
('MATH-G3-CAP-WGHT', '수학', 3, '들이와 무게', '{}'),
('MATH-G3-CIRCLE-DATA', '수학', 3, '원의 성질과 자료의 정리', '{}')
on conflict (code) do nothing;

-- 2. 각 개념별 문항 4개씩 총 40개 등록

-- --------------------------------------------------------
-- 1) MATH-G3-ADD: 세 자리 수의 덧셈 (4문항)
-- --------------------------------------------------------
insert into questions (concept_id, difficulty, qtype, body, answer, misconception_map, source)
select id, 1, 'mcq',
  '{"stem": "324 + 153 의 값을 구하세요.", "choices": ["477", "471", "377", "467"]}'::jsonb,
  '{"correct_index": 0}'::jsonb,
  '{"1": "일의 자리 덧셈 계산 실수", "2": "백의 자리 덧셈을 빠뜨림", "3": "십의 자리 덧셈 계산 실수"}'::jsonb,
  'seed:math_g3'
from concepts where code = 'MATH-G3-ADD';

insert into questions (concept_id, difficulty, qtype, body, answer, misconception_map, source)
select id, 2, 'mcq',
  '{"stem": "458 + 271 의 값을 구하세요.", "choices": ["629", "729", "719", "619"]}'::jsonb,
  '{"correct_index": 1}'::jsonb,
  '{"0": "백의 자리 올림을 빠뜨림", "2": "십의 자리 올림 계산 실수", "3": "올림을 두 번 빠뜨림"}'::jsonb,
  'seed:math_g3'
from concepts where code = 'MATH-G3-ADD';

insert into questions (concept_id, difficulty, qtype, body, answer, misconception_map, source)
select id, 3, 'short',
  '{"stem": "민호는 동화책을 어제 268쪽, 오늘 175쪽 읽었습니다. 민호가 이틀 동안 읽은 동화책은 모두 몇 쪽인가요?"}'::jsonb,
  '{"value": "443"}'::jsonb,
  '{}'::jsonb,
  'seed:math_g3'
from concepts where code = 'MATH-G3-ADD';

insert into questions (concept_id, difficulty, qtype, body, answer, misconception_map, source)
select id, 4, 'mcq',
  '{"stem": "589 + 647 의 값을 구하세요.", "choices": ["1126", "1236", "1226", "1136"]}'::jsonb,
  '{"correct_index": 1}'::jsonb,
  '{"0": "백의 자리 올림(1)을 안 더함", "2": "십의 자리 덧셈 13에서 올림 계산 누락", "3": "백의 자리와 십의 자리 올림 착오"}'::jsonb,
  'seed:math_g3'
from concepts where code = 'MATH-G3-ADD';

-- --------------------------------------------------------
-- 2) MATH-G3-SUB: 세 자리 수의 뺄셈 (4문항)
-- --------------------------------------------------------
insert into questions (concept_id, difficulty, qtype, body, answer, misconception_map, source)
select id, 1, 'mcq',
  '{"stem": "578 - 234 의 값을 구하세요.", "choices": ["344", "342", "244", "354"]}'::jsonb,
  '{"correct_index": 0}'::jsonb,
  '{"1": "일의 자리 8-4 계산 실수", "2": "백의 자리 5-2 계산 실수", "3": "십의 자리 7-3 계산 실수"}'::jsonb,
  'seed:math_g3'
from concepts where code = 'MATH-G3-SUB';

insert into questions (concept_id, difficulty, qtype, body, answer, misconception_map, source)
select id, 2, 'mcq',
  '{"stem": "642 - 185 의 값을 구하세요.", "choices": ["457", "467", "557", "447"]}'::jsonb,
  '{"correct_index": 0}'::jsonb,
  '{"1": "받아내림 후 십의 자리 수 축소 안 함", "2": "백의 자리 뺄셈에서 받아내림 미반영", "3": "일의 자리 받아내림 계산 오류"}'::jsonb,
  'seed:math_g3'
from concepts where code = 'MATH-G3-SUB';

insert into questions (concept_id, difficulty, qtype, body, answer, misconception_map, source)
select id, 3, 'short',
  '{"stem": "과수원에 사과가 805개 있었습니다. 그중 348개를 상자에 담았을 때 남은 사과는 몇 개인가요?"}'::jsonb,
  '{"value": "457"}'::jsonb,
  '{}'::jsonb,
  'seed:math_g3'
from concepts where code = 'MATH-G3-SUB';

insert into questions (concept_id, difficulty, qtype, body, answer, misconception_map, source)
select id, 4, 'mcq',
  '{"stem": "700 - 284 의 값을 구하세요.", "choices": ["516", "416", "426", "526"]}'::jsonb,
  '{"correct_index": 1}'::jsonb,
  '{"0": "백의 자리 받아내림 처리 누락", "2": "십의 자리 9-8 계산 착오", "3": "백의 자리 받아내림과 십의 자리 오류 중복"}'::jsonb,
  'seed:math_g3'
from concepts where code = 'MATH-G3-SUB';

-- --------------------------------------------------------
-- 3) MATH-G3-MUL: 곱셈 (4문항)
-- --------------------------------------------------------
insert into questions (concept_id, difficulty, qtype, body, answer, misconception_map, source)
select id, 1, 'mcq',
  '{"stem": "32 × 3 의 값을 구하세요.", "choices": ["95", "96", "86", "93"]}'::jsonb,
  '{"correct_index": 1}'::jsonb,
  '{"0": "일의 자리 2×3=6인데 5로 착각", "2": "십의 자리 3×3 계산 착오", "3": "일의 자리 덧셈으로 계산"}'::jsonb,
  'seed:math_g3'
from concepts where code = 'MATH-G3-MUL';

insert into questions (concept_id, difficulty, qtype, body, answer, misconception_map, source)
select id, 2, 'mcq',
  '{"stem": "47 × 6 의 값을 구하세요.", "choices": ["242", "272", "282", "292"]}'::jsonb,
  '{"correct_index": 2}'::jsonb,
  '{"0": "올림수 4를 더하지 않고 곱함", "1": "올림수 4 대신 3을 더함", "3": "십의 자리 곱셈 4×6=24에서 올림 더할 때 5를 더함"}'::jsonb,
  'seed:math_g3'
from concepts where code = 'MATH-G3-MUL';

insert into questions (concept_id, difficulty, qtype, body, answer, misconception_map, source)
select id, 3, 'short',
  '{"stem": "한 상자에 구슬이 38개씩 들어 있습니다. 8상자에 들어 있는 구슬은 모두 몇 개인가요?"}'::jsonb,
  '{"value": "304"}'::jsonb,
  '{}'::jsonb,
  'seed:math_g3'
from concepts where code = 'MATH-G3-MUL';

insert into questions (concept_id, difficulty, qtype, body, answer, misconception_map, source)
select id, 5, 'mcq',
  '{"stem": "89 × 9 의 값을 구하세요.", "choices": ["801", "721", "811", "791"]}'::jsonb,
  '{"correct_index": 0}'::jsonb,
  '{"1": "올림수 8을 더하는 것을 잊음", "2": "일의 자리 올림 계산 오류", "3": "십의 자리 곱셈 계산 착오"}'::jsonb,
  'seed:math_g3'
from concepts where code = 'MATH-G3-MUL';

-- --------------------------------------------------------
-- 4) MATH-G3-DIV: 나눗셈 기초 (4문항)
-- --------------------------------------------------------
insert into questions (concept_id, difficulty, qtype, body, answer, misconception_map, source)
select id, 1, 'mcq',
  '{"stem": "36 ÷ 4 의 몫을 구하세요.", "choices": ["8", "9", "7", "6"]}'::jsonb,
  '{"correct_index": 1}'::jsonb,
  '{"0": "구구단 4×8=32로 착오", "2": "구구단 4×7=28로 착오", "3": "구구단 4×6=24로 착오"}'::jsonb,
  'seed:math_g3'
from concepts where code = 'MATH-G3-DIV';

insert into questions (concept_id, difficulty, qtype, body, answer, misconception_map, source)
select id, 2, 'short',
  '{"stem": "연필 48자루를 4명에게 똑같이 나누어 주려고 합니다. 한 사람당 몇 자루씩 받게 되나요?"}'::jsonb,
  '{"value": "12"}'::jsonb,
  '{}'::jsonb,
  'seed:math_g3'
from concepts where code = 'MATH-G3-DIV';

insert into questions (concept_id, difficulty, qtype, body, answer, misconception_map, source)
select id, 3, 'mcq',
  '{"stem": "75 ÷ 5 의 몫을 구하세요.", "choices": ["13", "14", "15", "16"]}'::jsonb,
  '{"correct_index": 2}'::jsonb,
  '{"0": "십의 자리 나누고 남은 25를 5로 나눌 때 몫을 3으로 착오", "1": "나눗셈 과정에서 차 20을 착각", "3": "몫을 1 크게 계산"}'::jsonb,
  'seed:math_g3'
from concepts where code = 'MATH-G3-DIV';

insert into questions (concept_id, difficulty, qtype, body, answer, misconception_map, source)
select id, 4, 'mcq',
  '{"stem": "92 ÷ 4 의 몫을 구하세요.", "choices": ["23", "22", "24", "21"]}'::jsonb,
  '{"correct_index": 0}'::jsonb,
  '{"1": "십의 자리 계산 후 남은 12÷4=3을 2로 잘못 계산", "2": "몫에 1을 더 더함", "3": "나누어떨어지지 않는다고 생각"}'::jsonb,
  'seed:math_g3'
from concepts where code = 'MATH-G3-DIV';

-- --------------------------------------------------------
-- 5) MATH-G3-FRAC: 분수와 단위분수 (4문항)
-- --------------------------------------------------------
insert into questions (concept_id, difficulty, qtype, body, answer, misconception_map, source)
select id, 1, 'mcq',
  '{"stem": "똑같이 5조각으로 나눈 케이크 중 3조각을 먹었습니다. 먹은 양을 분수로 나타내면 얼마인가요?", "choices": ["3/5", "5/3", "2/5", "1/5"]}'::jsonb,
  '{"correct_index": 0}'::jsonb,
  '{"1": "분모와 분자의 위치를 바꿈", "2": "남은 조각(2조각)의 분수를 선택", "3": "단위분수로 선택"}'::jsonb,
  'seed:math_g3'
from concepts where code = 'MATH-G3-FRAC';

insert into questions (concept_id, difficulty, qtype, body, answer, misconception_map, source)
select id, 2, 'mcq',
  '{"stem": "다음 중 단위분수는 어느 것인가요?", "choices": ["2/7", "1/8", "3/8", "8/1"]}'::jsonb,
  '{"correct_index": 1}'::jsonb,
  '{"0": "분자가 1이 아닌 분수 선택", "2": "분모가 8인 일반 분수 선택", "3": "분모가 1인 분수와 단위분수 혼동"}'::jsonb,
  'seed:math_g3'
from concepts where code = 'MATH-G3-FRAC';

insert into questions (concept_id, difficulty, qtype, body, answer, misconception_map, source)
select id, 3, 'short',
  '{"stem": "전체를 똑같이 7로 나눈 것 중 4를 분수로 나타내면 몇 분의 몇인가요? (예: 4/7 형식으로 입력)"}'::jsonb,
  '{"value": "4/7"}'::jsonb,
  '{}'::jsonb,
  'seed:math_g3'
from concepts where code = 'MATH-G3-FRAC';

insert into questions (concept_id, difficulty, qtype, body, answer, misconception_map, source)
select id, 4, 'mcq',
  '{"stem": "12의 3/4은 얼마인가요?", "choices": ["6", "8", "9", "10"]}'::jsonb,
  '{"correct_index": 2}'::jsonb,
  '{"0": "12를 4로 나눈 몫 3에 2를 곱함", "1": "12의 2/3로 잘못 계산", "3": "12에서 4를 뺀 값을 생각"}'::jsonb,
  'seed:math_g3'
from concepts where code = 'MATH-G3-FRAC';

-- --------------------------------------------------------
-- 6) MATH-G3-FRAC-CMP: 분수의 크기 비교 (4문항)
-- --------------------------------------------------------
insert into questions (concept_id, difficulty, qtype, body, answer, misconception_map, source)
select id, 1, 'mcq',
  '{"stem": "5/9 와 7/9 의 크기를 비교할 때 알맞은 기호는 무엇인가요?", "choices": [">", "<", "=", "알 수 없다"]}'::jsonb,
  '{"correct_index": 1}'::jsonb,
  '{"0": "분모가 같을 때 분자가 클수록 작다고 반대로 생각", "2": "분모가 같으면 크기가 같다고 오인", "3": "분수 크기 비교 원리 미이해"}'::jsonb,
  'seed:math_g3'
from concepts where code = 'MATH-G3-FRAC-CMP';

insert into questions (concept_id, difficulty, qtype, body, answer, misconception_map, source)
select id, 2, 'mcq',
  '{"stem": "단위분수 1/4 과 1/6 의 크기 비교로 옳은 것은 무엇인가요?", "choices": ["1/4 > 1/6", "1/4 < 1/6", "1/4 = 1/6", "비교할 수 없다"]}'::jsonb,
  '{"correct_index": 0}'::jsonb,
  '{"1": "분모 숫자가 더 큰 6이 더 크다고 오개념 가짐", "2": "단위분수는 모두 같다고 오인", "3": "단위분수의 크기 비교 개념 미숙"}'::jsonb,
  'seed:math_g3'
from concepts where code = 'MATH-G3-FRAC-CMP';

insert into questions (concept_id, difficulty, qtype, body, answer, misconception_map, source)
select id, 3, 'short',
  '{"stem": "1/3, 1/8, 1/5 중 가장 큰 분수를 쓰세요. (예: 1/3)"}'::jsonb,
  '{"value": "1/3"}'::jsonb,
  '{}'::jsonb,
  'seed:math_g3'
from concepts where code = 'MATH-G3-FRAC-CMP';

insert into questions (concept_id, difficulty, qtype, body, answer, misconception_map, source)
select id, 4, 'mcq',
  '{"stem": "다음 중 가장 작은 분수는 어느 것인가요?", "choices": ["6/11", "3/11", "8/11", "5/11"]}'::jsonb,
  '{"correct_index": 1}'::jsonb,
  '{"0": "분자가 중간인 값 선택", "2": "가장 큰 분수 선택 (가장 작은 것 요구)", "3": "분자 5가 가장 작다고 착각"}'::jsonb,
  'seed:math_g3'
from concepts where code = 'MATH-G3-FRAC-CMP';

-- --------------------------------------------------------
-- 7) MATH-G3-DEC: 소수 한 자리 수 (4문항)
-- --------------------------------------------------------
insert into questions (concept_id, difficulty, qtype, body, answer, misconception_map, source)
select id, 1, 'mcq',
  '{"stem": "10분의 7을 소수로 나타내면 얼마인가요?", "choices": ["0.07", "0.7", "7.0", "1.7"]}'::jsonb,
  '{"correct_index": 1}'::jsonb,
  '{"0": "소수 두 번째 자리에 적음", "2": "자연수 7로 착각", "3": "분모 1과 분자 7을 조합"}'::jsonb,
  'seed:math_g3'
from concepts where code = 'MATH-G3-DEC';

insert into questions (concept_id, difficulty, qtype, body, answer, misconception_map, source)
select id, 2, 'short',
  '{"stem": "3과 0.4를 합한 수를 소수로 쓰세요."}'::jsonb,
  '{"value": "3.4"}'::jsonb,
  '{}'::jsonb,
  'seed:math_g3'
from concepts where code = 'MATH-G3-DEC';

insert into questions (concept_id, difficulty, qtype, body, answer, misconception_map, source)
select id, 3, 'mcq',
  '{"stem": "2.8 은 0.1이 몇 개 있는 수인가요?", "choices": ["28개", "2.8개", "8개", "20개"]}'::jsonb,
  '{"correct_index": 0}'::jsonb,
  '{"1": "소수점 위치를 숫자로 착각", "2": "소수 첫째 자리 8만 생각", "3": "자연수 부분 2만 20개로 생각"}'::jsonb,
  'seed:math_g3'
from concepts where code = 'MATH-G3-DEC';

insert into questions (concept_id, difficulty, qtype, body, answer, misconception_map, source)
select id, 4, 'mcq',
  '{"stem": "4.5 와 3.9 의 크기를 비교할 때 알맞은 설명은 무엇인가요?", "choices": ["4.5가 더 크다", "3.9가 더 크다", "두 수가 같다", "비교할 수 없다"]}'::jsonb,
  '{"correct_index": 0}'::jsonb,
  '{"1": "소수 뒷자리 9가 5보다 커서 3.9가 더 크다고 착오", "2": "소수점 앞자리 무시", "3": "소수 크기 비교 오개념"}'::jsonb,
  'seed:math_g3'
from concepts where code = 'MATH-G3-DEC';

-- --------------------------------------------------------
-- 8) MATH-G3-LEN-TIME: 길이와 시간 (4문항)
-- --------------------------------------------------------
insert into questions (concept_id, difficulty, qtype, body, answer, misconception_map, source)
select id, 1, 'mcq',
  '{"stem": "3cm 5mm 는 몇 mm 인가요?", "choices": ["35mm", "305mm", "350mm", "8mm"]}'::jsonb,
  '{"correct_index": 0}'::jsonb,
  '{"1": "1cm = 100mm 로 오인", "2": "자연수 뒤에 0을 2개 붙임", "3": "3과 5를 그냥 더함"}'::jsonb,
  'seed:math_g3'
from concepts where code = 'MATH-G3-LEN-TIME';

insert into questions (concept_id, difficulty, qtype, body, answer, misconception_map, source)
select id, 2, 'short',
  '{"stem": "1분 40초는 모두 몇 초인가요?"}'::jsonb,
  '{"value": "100"}'::jsonb,
  '{}'::jsonb,
  'seed:math_g3'
from concepts where code = 'MATH-G3-LEN-TIME';

insert into questions (concept_id, difficulty, qtype, body, answer, misconception_map, source)
select id, 3, 'mcq',
  '{"stem": "2시간 15분 + 1시간 50분 은 얼마인가요?", "choices": ["4시간 5분", "3시간 65분", "4시간 15분", "3시간 5분"]}'::jsonb,
  '{"correct_index": 0}'::jsonb,
  '{"1": "60분이 1시간으로 올림되는 과정을 거치지 않음", "2": "시간 올림 과정에서 10분을 더함", "3": "시간 덧셈 받아올림 누락"}'::jsonb,
  'seed:math_g3'
from concepts where code = 'MATH-G3-LEN-TIME';

insert into questions (concept_id, difficulty, qtype, body, answer, misconception_map, source)
select id, 4, 'mcq',
  '{"stem": "2500m 를 km와 m로 바르게 나타낸 것은 무엇인가요?", "choices": ["2km 500m", "25km 0m", "20km 500m", "2km 50m"]}'::jsonb,
  '{"correct_index": 0}'::jsonb,
  '{"1": "1km = 100m 로 착오", "2": "자연수 자리 단위 착오", "3": "500m를 50m로 축소"}'::jsonb,
  'seed:math_g3'
from concepts where code = 'MATH-G3-LEN-TIME';

-- --------------------------------------------------------
-- 9) MATH-G3-CAP-WGHT: 들이와 무게 (4문항)
-- --------------------------------------------------------
insert into questions (concept_id, difficulty, qtype, body, answer, misconception_map, source)
select id, 1, 'mcq',
  '{"stem": "4L 200mL 는 몇 mL 인가요?", "choices": ["4200mL", "4020mL", "420mL", "600mL"]}'::jsonb,
  '{"correct_index": 0}'::jsonb,
  '{"1": "십의 자리 수 0 단위 착오", "2": "4000mL를 400mL로 착오", "3": "4와 200을 그냥 덧셈"}'::jsonb,
  'seed:math_g3'
from concepts where code = 'MATH-G3-CAP-WGHT';

insert into questions (concept_id, difficulty, qtype, body, answer, misconception_map, source)
select id, 2, 'short',
  '{"stem": "3kg 600g 은 모두 몇 g 인가요?"}'::jsonb,
  '{"value": "3600"}'::jsonb,
  '{}'::jsonb,
  'seed:math_g3'
from concepts where code = 'MATH-G3-CAP-WGHT';

insert into questions (concept_id, difficulty, qtype, body, answer, misconception_map, source)
select id, 3, 'mcq',
  '{"stem": "5kg 300g - 2kg 800g 의 값을 구하세요.", "choices": ["2kg 500m", "2kg 500g", "3kg 500g", "2kg 300g"]}'::jsonb,
  '{"correct_index": 1}'::jsonb,
  '{"0": "단위를 m로 잘못 표기", "2": "1kg(1000g) 받아내림 후 kg 자리를 줄이지 않음", "3": "g 자리 받아내림 계산 오류"}'::jsonb,
  'seed:math_g3'
from concepts where code = 'MATH-G3-CAP-WGHT';

insert into questions (concept_id, difficulty, qtype, body, answer, misconception_map, source)
select id, 4, 'mcq',
  '{"stem": "다음 중 가장 무게가 무거운 것은 어느 것인가요?", "choices": ["2kg 100g", "1900g", "2500g", "2kg 400g"]}'::jsonb,
  '{"correct_index": 2}'::jsonb,
  '{"0": "2kg 100g = 2100g로 변환하였으나 2500g보다 작음", "1": "숫자 1900이 제일 크다고 착각", "3": "2kg 400g = 2400g로 2500g보다 작음을 놓침"}'::jsonb,
  'seed:math_g3'
from concepts where code = 'MATH-G3-CAP-WGHT';

-- --------------------------------------------------------
-- 10) MATH-G3-CIRCLE-DATA: 원과 자료의 정리 (4문항)
-- --------------------------------------------------------
insert into questions (concept_id, difficulty, qtype, body, answer, misconception_map, source)
select id, 1, 'mcq',
  '{"stem": "원 위의 한 점과 원의 중심을 이은 선분을 무엇이라고 하나요?", "choices": ["반지름", "지름", "원주", "호"]}'::jsonb,
  '{"correct_index": 0}'::jsonb,
  '{"1": "원의 중심을 지나 원 위의 두 점을 이은 선분(지름)과 혼동", "2": "원의 둘레(원주)와 혼동", "3": "원의 일부분(호)과 혼동"}'::jsonb,
  'seed:math_g3'
from concepts where code = 'MATH-G3-CIRCLE-DATA';

insert into questions (concept_id, difficulty, qtype, body, answer, misconception_map, source)
select id, 2, 'short',
  '{"stem": "반지름이 6cm인 원의 지름은 몇 cm인가요?"}'::jsonb,
  '{"value": "12"}'::jsonb,
  '{}'::jsonb,
  'seed:math_g3'
from concepts where code = 'MATH-G3-CIRCLE-DATA';

insert into questions (concept_id, difficulty, qtype, body, answer, misconception_map, source)
select id, 3, 'mcq',
  '{"stem": "그림그래프에서 큰 그림이 10개, 작은 그림이 1개를 나타냅니다. 큰 그림 4개와 작은 그림 3개가 나타내는 수는 얼마인가요?", "choices": ["43", "34", "7", "430"]}'::jsonb,
  '{"correct_index": 0}'::jsonb,
  '{"1": "십의 자리와 일의 자리를 거꾸로 읽음", "2": "그림의 개수 4+3=7만 더함", "3": "단위 뒤에 0을 더 붙임"}'::jsonb,
  'seed:math_g3'
from concepts where code = 'MATH-G3-CIRCLE-DATA';

insert into questions (concept_id, difficulty, qtype, body, answer, misconception_map, source)
select id, 4, 'mcq',
  '{"stem": "지름이 18cm인 원이 있습니다. 이 원의 반지름은 몇 cm인가요?", "choices": ["9cm", "36cm", "18cm", "6cm"]}'::jsonb,
  '{"correct_index": 0}'::jsonb,
  '{"1": "지름에 2를 곱함 (반지름=지름÷2 관계 혼동)", "2": "지름과 반지름이 같다고 생각", "3": "18을 3으로 나눔"}'::jsonb,
  'seed:math_g3'
from concepts where code = 'MATH-G3-CIRCLE-DATA';

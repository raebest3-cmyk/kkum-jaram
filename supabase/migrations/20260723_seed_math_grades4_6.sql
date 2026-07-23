-- ========================================================
-- 우리아이 꿈 자람 터 - 초등 4~6학년 수학 개념 및 시드 데이터
-- Migration Date: 2026-07-23
-- Description: 초등 4학년, 5학년, 6학년 대표 개념 및 문항 시드 데이터
-- ========================================================

-- --------------------------------------------------------
-- 1. 초등 4~6학년 개념(concepts) 시드 입력
-- --------------------------------------------------------
INSERT INTO concepts (id, code, name, grade, description) VALUES
  ('c-g4-angle', 'MATH-G4-ANGLE', '각도와 삼각형의 성질', 4, '각의 크기 측정, 삼각형과 사각형의 내각의 합'),
  ('c-g4-decimal', 'MATH-G4-DECIMAL', '소수의 덧셈과 뺄셈', 4, '소수 한 자리/두 자리 수의 개념 및 자리별 덧뺄셈'),
  ('c-g5-factor', 'MATH-G5-FACTOR', '약수와 배수', 5, '공약수, 최대공약수, 공배수, 최소공배수의 원리'),
  ('c-g5-frac-mul', 'MATH-G5-FRAC-MUL', '분수의 곱셈', 5, '(진분수) × (자연수) 및 분수끼리의 곱셈 계산'),
  ('c-g6-ratio', 'MATH-G6-RATIO', '비와 비율', 6, '두 수의 양적 비교, 비율과 백분율(%) 원리'),
  ('c-g6-vol', 'MATH-G6-VOL', '직육면체의 부피와 겉넓이', 6, '직육면체와 정육면체의 부피 계산 공식 및 겉넓이')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  grade = EXCLUDED.grade,
  description = EXCLUDED.description;

-- --------------------------------------------------------
-- 2. 초등 4학년 문항 (questions) 시드 입력
-- --------------------------------------------------------
INSERT INTO questions (id, concept_id, concept_code, concept_name, difficulty, qtype, body, answer, misconception_map) VALUES
  (
    'q-g4-angle-1',
    'c-g4-angle',
    'MATH-G4-ANGLE',
    '각도와 삼각형의 성질',
    1,
    'mcq',
    '{"stem": "삼각형의 세 각의 크기의 합은 몇 도(°)일까요?", "choices": ["180°", "360°", "90°", "270°"]}',
    '{"correct_index": 0, "explanation": "모든 삼각형의 세 내각의 합은 항상 180°입니다."}',
    '{"1": "사각형의 내각의 합(360°)과 착각하였습니다."}'
  ),
  (
    'q-g4-decimal-1',
    'c-g4-decimal',
    'MATH-G4-DECIMAL',
    '소수의 덧셈과 뺄셈',
    2,
    'mcq',
    '{"stem": "2.4 + 1.8 의 계산 결과는 얼마일까요?", "choices": ["4.2", "3.12", "4.12", "3.2"]}',
    '{"correct_index": 0, "explanation": "소수점을 맞추어 4+8=12 (1 올림), 2+1+1=4 가 되어 4.2가 됩니다."}',
    '{"1": "소수점 아래 수 4+8=12를 소수점 아래에 그대로 12로 적어 3.12로 오답 처리하였습니다."}'
  );

-- --------------------------------------------------------
-- 3. 초등 5학년 문항 (questions) 시드 입력
-- --------------------------------------------------------
INSERT INTO questions (id, concept_id, concept_code, concept_name, difficulty, qtype, body, answer, misconception_map) VALUES
  (
    'q-g5-factor-1',
    'c-g5-factor',
    'MATH-G5-FACTOR',
    '약수와 배수',
    2,
    'mcq',
    '{"stem": "12와 18의 최대공약수는 얼마일까요?", "choices": ["6", "3", "36", "12"]}',
    '{"correct_index": 0, "explanation": "12의 약수(1,2,3,4,6,12)와 18의 약수(1,2,3,6,9,18) 중 공통으로 가장 큰 수는 6입니다."}',
    '{"2": "최대공약수 대신 최소공배수(36)를 구하였습니다."}'
  ),
  (
    'q-g5-frac-1',
    'c-g5-frac-mul',
    'MATH-G5-FRAC-MUL',
    '분수의 곱셈',
    2,
    'mcq',
    '{"stem": "3/4 × 2 의 계산 결과는 얼마일까요?", "choices": ["3/2 (또는 1과 1/2)", "6/8", "3/8", "6/2"]}',
    '{"correct_index": 0, "explanation": "분자에 자연수를 곱하여 (3×2)/4 = 6/4 약분하면 3/2 (1과 1/2)가 됩니다."}',
    '{"1": "분모와 분자 모두에 자연수 2를 곱하여 크기가 같은 분수를 만들었습니다."}'
  );

-- --------------------------------------------------------
-- 4. 초등 6학년 문항 (questions) 시드 입력
-- --------------------------------------------------------
INSERT INTO questions (id, concept_id, concept_code, concept_name, difficulty, qtype, body, answer, misconception_map) VALUES
  (
    'q-g6-ratio-1',
    'c-g6-ratio',
    'MATH-G6-RATIO',
    '비와 비율',
    2,
    'mcq',
    '{"stem": "전체 20명 중 여학생이 5명일 때, 여학생의 비율을 백분율(%)로 나타내면 얼마일까요?", "choices": ["25%", "20%", "5%", "50%"]}',
    '{"correct_index": 0, "explanation": "비율 5/20 = 1/4 이며, 여기에 100을 곱하면 25%가 됩니다."}',
    '{"1": "전체 인원 수인 20을 그대로 퍼센트로 착각하였습니다."}'
  ),
  (
    'q-g6-vol-1',
    'c-g6-vol',
    'MATH-G6-VOL',
    '직육면체의 부피와 겉넓이',
    2,
    'mcq',
    '{"stem": "가로 4cm, 세로 3cm, 높이 5cm인 직육면체의 부피는 몇 ㎤ 일까요?", "choices": ["60 ㎤", "12 ㎤", "47 ㎤", "94 ㎤"]}',
    '{"correct_index": 0, "explanation": "직육면체의 부피 = 가로 × 세로 × 높이 = 4 × 3 × 5 = 60 ㎤ 입니다."}',
    '{"3": "부피 공식 대신 겉넓이(94 ㎠)를 계산하였습니다."}'
  );

import { createClient } from './supabase'
import { calculateMastery } from './mastery'

export interface QuestionBody {
  stem: string
  choices?: string[]
}

export interface QuestionAnswer {
  correct_index?: number
  value?: string
}

export interface QuestionItem {
  id: string
  concept_id: string
  concept_code: string
  concept_name: string
  difficulty: number
  qtype: 'mcq' | 'short'
  body: QuestionBody
  answer: QuestionAnswer
  misconception_map: Record<string, string>
}

export interface AttemptRecord {
  child_id: string
  question_id: string
  is_correct: boolean
  response: any
  latency_ms: number
  created_at?: string
}

// seed_math_grade3.sql 기반 40문항 시드 데이터셋 (Supabase 미연동 시 폴백)
export const SEED_QUESTIONS: QuestionItem[] = [
  // 1) MATH-G3-ADD (세 자리 수의 덧셈)
  {
    id: 'q-add-1',
    concept_id: 'c-add',
    concept_code: 'MATH-G3-ADD',
    concept_name: '세 자리 수의 덧셈',
    difficulty: 1,
    qtype: 'mcq',
    body: { stem: '324 + 153 의 값을 구하세요.', choices: ['477', '471', '377', '467'] },
    answer: { correct_index: 0 },
    misconception_map: { '1': '일의 자리 덧셈 계산 실수', '2': '백의 자리 덧셈을 빠뜨림', '3': '십의 자리 덧셈 계산 실수' }
  },
  {
    id: 'q-add-2',
    concept_id: 'c-add',
    concept_code: 'MATH-G3-ADD',
    concept_name: '세 자리 수의 덧셈',
    difficulty: 2,
    qtype: 'mcq',
    body: { stem: '458 + 271 의 값을 구하세요.', choices: ['629', '729', '719', '619'] },
    answer: { correct_index: 1 },
    misconception_map: { '0': '백의 자리 올림을 빠뜨림', '2': '십의 자리 올림 계산 실수', '3': '올림을 두 번 빠뜨림' }
  },
  {
    id: 'q-add-3',
    concept_id: 'c-add',
    concept_code: 'MATH-G3-ADD',
    concept_name: '세 자리 수의 덧셈',
    difficulty: 3,
    qtype: 'short',
    body: { stem: '민호는 동화책을 어제 268쪽, 오늘 175쪽 읽었습니다. 민호가 이틀 동안 읽은 동화책은 모두 몇 쪽인가요?' },
    answer: { value: '443' },
    misconception_map: {}
  },
  {
    id: 'q-add-4',
    concept_id: 'c-add',
    concept_code: 'MATH-G3-ADD',
    concept_name: '세 자리 수의 덧셈',
    difficulty: 4,
    qtype: 'mcq',
    body: { stem: '589 + 647 의 값을 구하세요.', choices: ['1126', '1236', '1226', '1136'] },
    answer: { correct_index: 1 },
    misconception_map: { '0': '백의 자리 올림(1)을 안 더함', '2': '십의 자리 덧셈 13에서 올림 계산 누락', '3': '백의 자리와 십의 자리 올림 착오' }
  },

  // 2) MATH-G3-SUB (세 자리 수의 뺄셈)
  {
    id: 'q-sub-1',
    concept_id: 'c-sub',
    concept_code: 'MATH-G3-SUB',
    concept_name: '세 자리 수의 뺄셈',
    difficulty: 1,
    qtype: 'mcq',
    body: { stem: '578 - 234 의 값을 구하세요.', choices: ['344', '342', '244', '354'] },
    answer: { correct_index: 0 },
    misconception_map: { '1': '일의 자리 8-4 계산 실수', '2': '백의 자리 5-2 계산 실수', '3': '십의 자리 7-3 계산 실수' }
  },
  {
    id: 'q-sub-2',
    concept_id: 'c-sub',
    concept_code: 'MATH-G3-SUB',
    concept_name: '세 자리 수의 뺄셈',
    difficulty: 2,
    qtype: 'mcq',
    body: { stem: '642 - 185 의 값을 구하세요.', choices: ['457', '467', '557', '447'] },
    answer: { correct_index: 0 },
    misconception_map: { '1': '받아내림 후 십의 자리 수 축소 안 함', '2': '백의 자리 뺄셈에서 받아내림 미반영', '3': '일의 자리 받아내림 계산 오류' }
  },
  {
    id: 'q-sub-3',
    concept_id: 'c-sub',
    concept_code: 'MATH-G3-SUB',
    concept_name: '세 자리 수의 뺄셈',
    difficulty: 3,
    qtype: 'short',
    body: { stem: '과수원에 사과가 805개 있었습니다. 그중 348개를 상자에 담았을 때 남은 사과는 몇 개인가요?' },
    answer: { value: '457' },
    misconception_map: {}
  },
  {
    id: 'q-sub-4',
    concept_id: 'c-sub',
    concept_code: 'MATH-G3-SUB',
    concept_name: '세 자리 수의 뺄셈',
    difficulty: 4,
    qtype: 'mcq',
    body: { stem: '700 - 284 의 값을 구하세요.', choices: ['516', '416', '426', '526'] },
    answer: { correct_index: 1 },
    misconception_map: { '0': '백의 자리 받아내림 처리 누락', '2': '십의 자리 9-8 계산 착오', '3': '백의 자리 받아내림과 십의 자리 오류 중복' }
  },

  // 3) MATH-G3-MUL (곱셈)
  {
    id: 'q-mul-1',
    concept_id: 'c-mul',
    concept_code: 'MATH-G3-MUL',
    concept_name: '곱셈 (두 자리 수 × 한 자리 수)',
    difficulty: 1,
    qtype: 'mcq',
    body: { stem: '32 × 3 의 값을 구하세요.', choices: ['95', '96', '86', '93'] },
    answer: { correct_index: 1 },
    misconception_map: { '0': '일의 자리 2×3=6인데 5로 착각', '2': '십의 자리 3×3 계산 착오', '3': '일의 자리 덧셈으로 계산' }
  },
  {
    id: 'q-mul-2',
    concept_id: 'c-mul',
    concept_code: 'MATH-G3-MUL',
    concept_name: '곱셈 (두 자리 수 × 한 자리 수)',
    difficulty: 2,
    qtype: 'mcq',
    body: { stem: '47 × 6 의 값을 구하세요.', choices: ['242', '272', '282', '292'] },
    answer: { correct_index: 2 },
    misconception_map: { '0': '올림수 4를 더하지 않고 곱함', '1': '올림수 4 대신 3을 더함', '3': '십의 자리 곱셈 4×6=24에서 올림 더할 때 5를 더함' }
  },

  // 4) MATH-G3-DIV (나눗셈)
  {
    id: 'q-div-1',
    concept_id: 'c-div',
    concept_code: 'MATH-G3-DIV',
    concept_name: '나눗셈 기초',
    difficulty: 1,
    qtype: 'mcq',
    body: { stem: '36 ÷ 4 의 몫을 구하세요.', choices: ['8', '9', '7', '6'] },
    answer: { correct_index: 1 },
    misconception_map: { '0': '구구단 4×8=32로 착오', '2': '구구단 4×7=28로 착오', '3': '구구단 4×6=24로 착오' }
  },
  {
    id: 'q-div-2',
    concept_id: 'c-div',
    concept_code: 'MATH-G3-DIV',
    concept_name: '나눗셈 기초',
    difficulty: 2,
    qtype: 'short',
    body: { stem: '연필 48자루를 4명에게 똑같이 나누어 주려고 합니다. 한 사람당 몇 자루씩 받게 되나요?' },
    answer: { value: '12' },
    misconception_map: {}
  },

  // 5) MATH-G3-FRAC (분수)
  {
    id: 'q-frac-1',
    concept_id: 'c-frac',
    concept_code: 'MATH-G3-FRAC',
    concept_name: '분수와 단위분수',
    difficulty: 1,
    qtype: 'mcq',
    body: { stem: '똑같이 5조각으로 나눈 케이크 중 3조각을 먹었습니다. 먹은 양을 분수로 나타내면 얼마인가요?', choices: ['3/5', '5/3', '2/5', '1/5'] },
    answer: { correct_index: 0 },
    misconception_map: { '1': '분모와 분자의 위치를 바꿈', '2': '남은 조각(2조각)의 분수를 선택', '3': '단위분수로 선택' }
  },
  {
    id: 'q-frac-2',
    concept_id: 'c-frac',
    concept_code: 'MATH-G3-FRAC',
    concept_name: '분수와 단위분수',
    difficulty: 2,
    qtype: 'mcq',
    body: { stem: '다음 중 단위분수는 어느 것인가요?', choices: ['2/7', '1/8', '3/8', '8/1'] },
    answer: { correct_index: 1 },
    misconception_map: { '0': '분자가 1이 아닌 분수 선택', '2': '분모가 8인 일반 분수 선택', '3': '분모가 1인 분수와 단위분수 혼동' }
  },

  // 6) MATH-G3-FRAC-CMP (분수의 크기 비교)
  {
    id: 'q-cmp-1',
    concept_id: 'c-cmp',
    concept_code: 'MATH-G3-FRAC-CMP',
    concept_name: '분수의 크기 비교',
    difficulty: 1,
    qtype: 'mcq',
    body: { stem: '5/9 와 7/9 의 크기를 비교할 때 알맞은 기호는 무엇인가요?', choices: ['>', '<', '=', '알 수 없다'] },
    answer: { correct_index: 1 },
    misconception_map: { '0': '분모가 같을 때 분자가 클수록 작다고 반대로 생각', '2': '분모가 같으면 크기가 같다고 오인', '3': '분수 크기 비교 원리 미이해' }
  },

  // 7) MATH-G3-DEC (소수 한 자리 수)
  {
    id: 'q-dec-1',
    concept_id: 'c-dec',
    concept_code: 'MATH-G3-DEC',
    concept_name: '소수 한 자리 수',
    difficulty: 1,
    qtype: 'mcq',
    body: { stem: '10분의 7을 소수로 나타내면 얼마인가요?', choices: ['0.07', '0.7', '7.0', '1.7'] },
    answer: { correct_index: 1 },
    misconception_map: { '0': '소수 두 번째 자리에 적음', '2': '자연수 7로 착각', '3': '분모 1과 분자 7을 조합' }
  }
]

// 오늘의 10문항 미션 생성
export async function getDailyMissionQuestions(): Promise<QuestionItem[]> {
  try {
    const supabase = createClient()
    const { data: questions, error } = await supabase
      .from('questions')
      .select('*, concepts(code, name)')
      .limit(20)

    if (!error && questions && questions.length >= 10) {
      const items: QuestionItem[] = questions.slice(0, 10).map((q: any) => ({
        id: q.id,
        concept_id: q.concept_id,
        concept_code: q.concepts?.code || 'MATH-G3-ADD',
        concept_name: q.concepts?.name || '초등 수학',
        difficulty: q.difficulty || 1,
        qtype: q.qtype || 'mcq',
        body: q.body,
        answer: q.answer,
        misconception_map: q.misconception_map || {}
      }))
      return items
    }
  } catch (e) {
    console.warn('Supabase fetch questions fallback to seed questions:', e)
  }

  // Fallback: SEED_QUESTIONS에서 10개 추출
  return [...SEED_QUESTIONS, ...SEED_QUESTIONS].slice(0, 10)
}

// 미션 풀이 완주 시 데이터 저장 & 숙달도 갱신
export async function recordMissionCompletion(
  childId: string,
  results: Array<{ question: QuestionItem; isCorrect: boolean; userResponse: any; latencyMs: number }>
) {
  // 1. attempts 테이블 및 로컬 저장
  const attemptsToInsert = results.map((r) => ({
    child_id: childId,
    question_id: r.question.id,
    is_correct: r.isCorrect,
    response: r.userResponse,
    latency_ms: r.latencyMs
  }))

  try {
    const supabase = createClient()
    await supabase.from('attempts').insert(attemptsToInsert)
  } catch (e) {
    console.warn('Supabase attempts insert fallback:', e)
  }

  // 2. concept_mastery 지수이동평균(EMA) 계산 및 업데이트
  const conceptResultsMap: Record<string, boolean[]> = {}
  results.forEach((r) => {
    const cId = r.question.concept_code
    if (!conceptResultsMap[cId]) conceptResultsMap[cId] = []
    conceptResultsMap[cId].push(r.isCorrect)
  })

  // 로컬 마스터리 갱신
  if (typeof window !== 'undefined') {
    const LOCAL_MASTERY_KEY = 'kkum_jaram_mastery'
    const storedMastery = localStorage.getItem(LOCAL_MASTERY_KEY)
    let masteryData: Record<string, number> = storedMastery
      ? JSON.parse(storedMastery)
      : {
          'MATH-G3-ADD': 0.75,
          'MATH-G3-SUB': 0.65,
          'MATH-G3-[#0D8A68]': 0.50,
          'MATH-G3-MUL': 0.60,
          'MATH-G3-DIV': 0.40,
          'MATH-G3-FRAC': 0.40
        }

    Object.entries(conceptResultsMap).forEach(([conceptCode, isCorrectList]) => {
      let current = masteryData[conceptCode] ?? 0.5
      isCorrectList.forEach((isCorrect) => {
        current = calculateMastery(current, isCorrect, 0.3)
      })
      masteryData[conceptCode] = current
    })

    localStorage.setItem(LOCAL_MASTERY_KEY, JSON.stringify(masteryData))
  }
}

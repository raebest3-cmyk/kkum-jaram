import { createClient } from './supabase'
import { calculateMastery } from './mastery'

export interface QuestionBody {
  stem: string
  choices?: string[]
}

export interface QuestionAnswer {
  correct_index?: number
  value?: string
  explanation?: string
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
    body: {
      stem: '345 + 234 의 계산 결과는 얼마일까요?',
      choices: ['569', '579 font-bold', '589', '479']
    },
    answer: {
      correct_index: 1,
      explanation: '각 자리별로 더해줍니다. (300+200=500, 40+30=70, 5+4=9) ➔ 579가 됩니다.'
    },
    misconception_map: {
      '0': '십의 자리 덧셈 4+3=7 을 6으로 잘못 계산하였습니다.',
      '2': '일의 자리 덧셈 5+4=9 를 십의 자리로 착각해 8로 계산하였습니다.'
    }
  },
  {
    id: 'q-add-2',
    concept_id: 'c-add',
    concept_code: 'MATH-G3-ADD',
    concept_name: '세 자리 수의 덧셈',
    difficulty: 2,
    qtype: 'mcq',
    body: {
      stem: '468 + 375 의 계산 결과는 얼마일까요?',
      choices: ['843', '833', '743', '853']
    },
    answer: {
      correct_index: 0,
      explanation: '8+5=13에서 1을 받아올림하고, 1+6+7=14에서 1을 받아올림하면 4+3+1=8 이 되어 843이 됩니다.'
    },
    misconception_map: {
      '1': '십의 자리 받아올림 수(1)를 더하지 않고 계산하였습니다.',
      '2': '백의 자리 받아올림 수(1)를 더하지 않아 700대가 되었습니다.'
    }
  },
  {
    id: 'q-sub-1',
    concept_id: 'c-sub',
    concept_code: 'MATH-G3-SUB',
    concept_name: '세 자리 수의 뺄셈',
    difficulty: 2,
    qtype: 'mcq',
    body: {
      stem: '652 - 284 의 계산 결과는 얼마일까요?',
      choices: ['368', '378', '468', '366']
    },
    answer: {
      correct_index: 0,
      explanation: '일의 자리 2-4는 십의 자리에서 빌려와 12-4=8, 십의 자리는 14-8=6, 백의 자리는 5-2=3 이 되어 368입니다.'
    },
    misconception_map: {
      '1': '십의 자리 받아내림 계산에서 14-8을 15-8로 잘못 계산하였습니다.'
    }
  },
  {
    id: 'q-mul-1',
    concept_id: 'c-mul',
    concept_code: 'MATH-G3-MUL',
    concept_name: '두 자리 수 × 한 자리 수',
    difficulty: 2,
    qtype: 'mcq',
    body: {
      stem: '24 × 6 의 계산 결과는 얼마일까요?',
      choices: ['144', '124', '134', '154']
    },
    answer: {
      correct_index: 0,
      explanation: '4×6=24 (일의 자리 4, 십의 자리 올림 2), 2×6=12 에 2를 더해 14가 되므로 144입니다.'
    },
    misconception_map: {
      '1': '일의 자리 올림 수 2를 더하는 것을 누락하였습니다.'
    }
  },
  {
    id: 'q-div-1',
    concept_id: 'c-div',
    concept_code: 'MATH-G3-DIV',
    concept_name: '나눗셈의 기초',
    difficulty: 1,
    qtype: 'mcq',
    body: {
      stem: '사과 15개를 3명에게 똑같이 나누어 주면 한 사람이 몇 개씩 받게 될까요?',
      choices: ['5개', '4개', '6개', '3개']
    },
    answer: {
      correct_index: 0,
      explanation: '15 ÷ 3 = 5 이므로 한 사람이 5개씩 받게 됩니다.'
    },
    misconception_map: {
      '1': '곱셈구구 3단(3×4=12)으로 잘못 몫을 구했습니다.'
    }
  },
  {
    id: 'q-frac-1',
    concept_id: 'c-frac',
    concept_code: 'MATH-G3-FRAC',
    concept_name: '분수의 이해',
    difficulty: 1,
    qtype: 'mcq',
    body: {
      stem: '피자 한 판을 똑같이 8조각으로 나눈 것 중 3조각을 분수로 나타내면 얼마일까요?',
      choices: ['3/8', '1/8', '5/8', '8/3']
    },
    answer: {
      correct_index: 0,
      explanation: '전체 조각 수 8이 분모가 되고, 먹은 조각 수 3이 분자가 되어 3/8 이 됩니다.'
    },
    misconception_map: {
      '3': '분모와 분자의 위치를 서로 바꾸어 썼습니다.'
    }
  }
]

// 오늘의 10문항 비동기 가져오기
export async function getDailyMissionQuestions(): Promise<QuestionItem[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.from('questions').select('*').limit(10)
    if (!error && data && data.length > 0) {
      return data.map((q: any) => ({
        id: q.id,
        concept_id: q.concept_id,
        concept_code: q.concept_code || 'MATH-G3-ADD',
        concept_name: q.concept_name || '초등 3학년 수학',
        difficulty: q.difficulty || 1,
        qtype: q.qtype || 'mcq',
        body: q.body,
        answer: q.answer,
        misconception_map: q.misconception_map || {}
      }))
    }
  } catch (e) {
    console.warn('Supabase questions fetch fallback:', e)
  }

  // 폴백 시드 데이터 반환 (10문항으로 확장)
  return [
    ...SEED_QUESTIONS,
    {
      id: 'q-add-3',
      concept_id: 'c-add',
      concept_code: 'MATH-G3-ADD',
      concept_name: '세 자리 수의 덧셈',
      difficulty: 1,
      qtype: 'mcq',
      body: {
        stem: '512 + 346 의 계산 결과는 얼마일까요?',
        choices: ['858', '848', '868', '758']
      },
      answer: {
        correct_index: 0,
        explanation: '500+300=800, 10+40=50, 2+6=8 이 되어 858이 됩니다.'
      },
      misconception_map: {
        '1': '십의 자리 덧셈을 잘못 계산했습니다.'
      }
    },
    {
      id: 'q-div-2',
      concept_id: 'c-div',
      concept_code: 'MATH-G3-DIV',
      concept_name: '나눗셈의 기초',
      difficulty: 2,
      qtype: 'mcq',
      body: {
        stem: '28 ÷ 4 의 몫은 얼마일까요?',
        choices: ['7', '6', '8', '9']
      },
      answer: {
        correct_index: 0,
        explanation: '4 × 7 = 28 이므로 몫은 7입니다.'
      },
      misconception_map: {
        '1': '곱셈구구 4×6=24 로 잘못 나눴습니다.'
      }
    },
    {
      id: 'q-frac-2',
      concept_id: 'c-frac',
      concept_code: 'MATH-G3-FRAC',
      concept_name: '분수의 크기 비교',
      difficulty: 2,
      qtype: 'mcq',
      body: {
        stem: '1/3 과 1/5 중 어느 쪽이 더 큰 분수일까요?',
        choices: ['1/3 이 더 크다', '1/5 가 더 크다', '두 분수의 크기는 같다']
      },
      answer: {
        correct_index: 0,
        explanation: '단위분수는 분모의 숫자가 작을수록 전체에서 차지하는 조각의 크기가 더 큽니다.'
      },
      misconception_map: {
        '1': '분모의 숫자 5가 3보다 커서 1/5가 더 크다고 착각하였습니다.'
      }
    },
    {
      id: 'q-sub-2',
      concept_id: 'c-sub',
      concept_code: 'MATH-G3-SUB',
      concept_name: '세 자리 수의 뺄셈',
      difficulty: 1,
      qtype: 'short',
      body: {
        stem: '400 - 150 의 정답 숫자를 입력하세요.'
      },
      answer: {
        value: '250',
        explanation: '400에서 100을 빼면 300, 300에서 50을 빼면 250이 됩니다.'
      },
      misconception_map: {}
    }
  ]
}

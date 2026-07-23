import { createClient } from './supabase'

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

// --------------------------------------------------------
// 초등 3학년 시드 데이터셋
// --------------------------------------------------------
export const SEED_QUESTIONS_G3: QuestionItem[] = [
  {
    id: 'q-add-1',
    concept_id: 'c-add',
    concept_code: 'MATH-G3-ADD',
    concept_name: '세 자리 수의 덧셈',
    difficulty: 1,
    qtype: 'mcq',
    body: {
      stem: '345 + 234 의 계산 결과는 얼마일까요?',
      choices: ['569', '579', '589', '479']
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

// --------------------------------------------------------
// 초등 4학년 시드 데이터셋
// --------------------------------------------------------
export const SEED_QUESTIONS_G4: QuestionItem[] = [
  {
    id: 'q-g4-angle-1',
    concept_id: 'c-g4-angle',
    concept_code: 'MATH-G4-ANGLE',
    concept_name: '각도와 삼각형의 성질',
    difficulty: 1,
    qtype: 'mcq',
    body: {
      stem: '삼각형의 세 각의 크기의 합은 몇 도(°)일까요?',
      choices: ['180°', '360°', '90°', '270°']
    },
    answer: {
      correct_index: 0,
      explanation: '모든 삼각형의 세 내각의 합은 항상 180°입니다.'
    },
    misconception_map: {
      '1': '사각형의 내각의 합(360°)과 착각하였습니다.'
    }
  },
  {
    id: 'q-g4-decimal-1',
    concept_id: 'c-g4-decimal',
    concept_code: 'MATH-G4-DECIMAL',
    concept_name: '소수의 덧셈과 뺄셈',
    difficulty: 2,
    qtype: 'mcq',
    body: {
      stem: '2.4 + 1.8 의 계산 결과는 얼마일까요?',
      choices: ['4.2', '3.12', '4.12', '3.2']
    },
    answer: {
      correct_index: 0,
      explanation: '소수점을 맞추어 4+8=12 (1 올림), 2+1+1=4 가 되어 4.2가 됩니다.'
    },
    misconception_map: {
      '1': '소수점 아래 수 4+8=12를 소수점 아래에 그대로 12로 적어 3.12로 오답 처리하였습니다.'
    }
  },
  {
    id: 'q-g4-angle-2',
    concept_id: 'c-g4-angle',
    concept_code: 'MATH-G4-ANGLE',
    concept_name: '각도와 삼각형의 성질',
    difficulty: 2,
    qtype: 'mcq',
    body: {
      stem: '삼각형의 두 각이 각각 50° 와 60° 일 때, 나머지 한 각의 크기는 얼마일까요?',
      choices: ['70°', '80°', '60°', '90°']
    },
    answer: {
      correct_index: 0,
      explanation: '삼각형의 세 각의 합은 180°이므로, 180 - (50 + 60) = 70° 가 됩니다.'
    },
    misconception_map: {
      '1': '합인 110°를 잘못 빼서 80°로 계산하였습니다.'
    }
  }
]

// --------------------------------------------------------
// 초등 5학년 시드 데이터셋
// --------------------------------------------------------
export const SEED_QUESTIONS_G5: QuestionItem[] = [
  {
    id: 'q-g5-factor-1',
    concept_id: 'c-g5-factor',
    concept_code: 'MATH-G5-FACTOR',
    concept_name: '약수와 배수',
    difficulty: 2,
    qtype: 'mcq',
    body: {
      stem: '12와 18의 최대공약수는 얼마일까요?',
      choices: ['6', '3', '36', '12']
    },
    answer: {
      correct_index: 0,
      explanation: '12의 약수(1,2,3,4,6,12)와 18의 약수(1,2,3,6,9,18) 중 공통으로 가장 큰 수는 6입니다.'
    },
    misconception_map: {
      '2': '최대공약수 대신 최소공배수(36)를 구하였습니다.'
    }
  },
  {
    id: 'q-g5-frac-1',
    concept_id: 'c-g5-frac-mul',
    concept_code: 'MATH-G5-FRAC-MUL',
    concept_name: '분수의 곱셈',
    difficulty: 2,
    qtype: 'mcq',
    body: {
      stem: '3/4 × 2 의 계산 결과는 얼마일까요?',
      choices: ['3/2 (또는 1과 1/2)', '6/8', '3/8', '6/2']
    },
    answer: {
      correct_index: 0,
      explanation: '분자에 자연수를 곱하여 (3×2)/4 = 6/4 약분하면 3/2 (1과 1/2)가 됩니다.'
    },
    misconception_map: {
      '1': '분모와 분자 모두에 자연수 2를 곱하여 크기가 같은 분수를 만들었습니다.'
    }
  }
]

// --------------------------------------------------------
// 초등 6학년 시드 데이터셋
// --------------------------------------------------------
export const SEED_QUESTIONS_G6: QuestionItem[] = [
  {
    id: 'q-g6-ratio-1',
    concept_id: 'c-g6-ratio',
    concept_code: 'MATH-G6-RATIO',
    concept_name: '비와 비율',
    difficulty: 2,
    qtype: 'mcq',
    body: {
      stem: '전체 20명 중 여학생이 5명일 때, 여학생의 비율을 백분율(%)로 나타내면 얼마일까요?',
      choices: ['25%', '20%', '5%', '50%']
    },
    answer: {
      correct_index: 0,
      explanation: '비율 5/20 = 1/4 이며, 여기에 100을 곱하면 25%가 됩니다.'
    },
    misconception_map: {
      '1': '전체 인원 수인 20을 그대로 퍼센트로 착각하였습니다.'
    }
  },
  {
    id: 'q-g6-vol-1',
    concept_id: 'c-g6-vol',
    concept_code: 'MATH-G6-VOL',
    concept_name: '직육면체의 부피와 겉넓이',
    difficulty: 2,
    qtype: 'mcq',
    body: {
      stem: '가로 4cm, 세로 3cm, 높이 5cm인 직육면체의 부피는 몇 ㎤ 일까요?',
      choices: ['60 ㎤', '12 ㎤', '47 ㎤', '94 ㎤']
    },
    answer: {
      correct_index: 0,
      explanation: '직육면체의 부피 = 가로 × 세로 × 높이 = 4 × 3 × 5 = 60 ㎤ 입니다.'
    },
    misconception_map: {
      '3': '부피 공식 대신 겉넓이(94 ㎠)를 계산하였습니다.'
    }
  }
]

// --------------------------------------------------------
// 학년별 맞춤 10문항 출제 함수
// --------------------------------------------------------
export async function getDailyMissionQuestions(grade: number = 3): Promise<QuestionItem[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .limit(10)

    if (!error && data && data.length > 0) {
      return data.map((q: any) => ({
        id: q.id,
        concept_id: q.concept_id,
        concept_code: q.concept_code || 'MATH-G3-ADD',
        concept_name: q.concept_name || '초등 수학',
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

  // 학년별 맞춤 폴백 시드 데이터셋 선택
  let selectedSeed = SEED_QUESTIONS_G3
  if (grade === 4) {
    selectedSeed = [...SEED_QUESTIONS_G4, ...SEED_QUESTIONS_G3]
  } else if (grade === 5) {
    selectedSeed = [...SEED_QUESTIONS_G5, ...SEED_QUESTIONS_G4, ...SEED_QUESTIONS_G3]
  } else if (grade === 6) {
    selectedSeed = [...SEED_QUESTIONS_G6, ...SEED_QUESTIONS_G5, ...SEED_QUESTIONS_G4, ...SEED_QUESTIONS_G3]
  }

  return selectedSeed
}

export async function fetchAdminQuestions(): Promise<QuestionItem[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('id', { ascending: false })

    if (!error && data && data.length > 0) {
      return data.map((item: any) => ({
        id: item.id,
        concept_id: item.concept_id || 'c-admin',
        concept_code: item.concept_code || 'MATH-CMS',
        concept_name: item.concept_name || '수학 문제',
        difficulty: item.difficulty || 1,
        qtype: item.qtype || 'mcq',
        body: typeof item.body === 'string' ? JSON.parse(item.body) : item.body,
        answer: typeof item.answer === 'string' ? JSON.parse(item.answer) : item.answer,
        misconception_map: typeof item.misconception_map === 'string' ? JSON.parse(item.misconception_map) : item.misconception_map || {}
      }))
    }
  } catch (e) {
    console.warn('Fetch admin questions fallback:', e)
  }

  return [...SEED_QUESTIONS_G3, ...SEED_QUESTIONS_G4, ...SEED_QUESTIONS_G5, ...SEED_QUESTIONS_G6]
}

export async function createAdminQuestion(q: Partial<QuestionItem>): Promise<QuestionItem> {
  const newQ: QuestionItem = {
    id: `q-cms-${Date.now()}`,
    concept_id: q.concept_id || 'c-cms',
    concept_code: q.concept_code || 'MATH-CMS',
    concept_name: q.concept_name || '수학 문제',
    difficulty: q.difficulty || 1,
    qtype: q.qtype || 'mcq',
    body: q.body || { stem: '새 문제입니다.', choices: ['1', '2', '3', '4'] },
    answer: q.answer || { correct_index: 0, explanation: '해설' },
    misconception_map: q.misconception_map || {}
  }

  try {
    const supabase = createClient()
    await supabase.from('questions').insert({
      id: newQ.id,
      concept_id: newQ.concept_id,
      concept_code: newQ.concept_code,
      concept_name: newQ.concept_name,
      difficulty: newQ.difficulty,
      qtype: newQ.qtype,
      body: newQ.body,
      answer: newQ.answer,
      misconception_map: newQ.misconception_map
    })
  } catch (e) {
    console.warn('Create admin question fallback:', e)
  }

  return newQ
}

export async function updateAdminQuestion(id: string, q: Partial<QuestionItem>): Promise<void> {
  try {
    const supabase = createClient()
    await supabase
      .from('questions')
      .update({
        concept_name: q.concept_name,
        difficulty: q.difficulty,
        body: q.body,
        answer: q.answer,
        misconception_map: q.misconception_map
      })
      .eq('id', id)
  } catch (e) {
    console.warn('Update admin question fallback:', e)
  }
}

export async function deleteAdminQuestion(id: string): Promise<void> {
  try {
    const supabase = createClient()
    await supabase.from('questions').delete().eq('id', id)
  } catch (e) {
    console.warn('Delete admin question fallback:', e)
  }
}


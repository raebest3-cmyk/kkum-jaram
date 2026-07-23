import { GoogleGenerativeAI } from '@google/generative-ai'
import { QuestionItem } from './questions'

// API 키 가져오기 헬퍼 (환경 변수 또는 local storage)
export function getGeminiApiKey(): string | null {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    return process.env.NEXT_PUBLIC_GEMINI_API_KEY
  }
  if (typeof process !== 'undefined' && process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY
  }
  if (typeof window !== 'undefined') {
    return localStorage.getItem('kkum_jaram_gemini_key')
  }
  return null
}

export function saveGeminiApiKey(key: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('kkum_jaram_gemini_key', key)
  }
}

// Google Gemini 1.5 Flash 모델 기반 오답 맞춤 처방전 생성
export async function generateDiagnosticPrescription(
  question: QuestionItem,
  userChoiceIndex: number | undefined,
  childName: string
): Promise<{ hint: string; analogy: string }> {
  let misconceptionHint = ''
  if (userChoiceIndex !== undefined && question.misconception_map) {
    misconceptionHint = question.misconception_map[String(userChoiceIndex)] || ''
  }

  const apiKey = getGeminiApiKey()

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

      const prompt = `너는 초등 3학년 수학 친절한 AI 선생님이야.
학습자 아이 이름: ${childName}
단원 및 개념: ${question.concept_name}
문제 내용: ${question.body.stem}
아이의 착각 오개념 태그: ${misconceptionHint || '계산 실수'}

초등 3학년 눈높이에 맞추어 친절하게 칭찬해주며, 
1) 아이가 고른 답에서 생긴 착각 포인트 (1문장)
2) 쉬운 일상 비유(피자 나누기, 쿠키 나누기, 상자 덧셈 등)를 통한 원리 설명 (2문장)
을 작성해 줘. 반말/존댓말 중 아이에게 친근한 따뜻한 존댓말(~해요!)로 답해줘.`

      const result = await model.generateContent(prompt)
      const responseText = result.response.text()

      if (responseText) {
        return {
          hint: misconceptionHint || '계산 과정에서 수의 자릿수나 단위를 잠시 착각했을 수 있어요!',
          analogy: responseText
        }
      }
    } catch (e) {
      console.warn('Gemini API call failed, using smart fallback:', e)
    }
  }

  // Fallback (API 키 미설정 시에도 정교하게 렌더링)
  const defaultAnalogy = question.concept_code.includes('FRAC')
    ? '전체를 똑같이 나눈 것 중 몇 조각인지 생각하는 원리와 같아요! 피자 한 판을 8조각으로 나누면 한 조각은 1/8이 된답니다.'
    : question.concept_code.includes('DIV')
    ? '쿠키 12개를 4개의 그릇에 똑같이 나누어 담으면 한 그릇에 3개씩 들어가는 것이 나눗셈의 원리예요!'
    : '세 자리 수 계산은 일의 자리, 십의 자리, 백의 자리를 차례대로 차근차근 더하거나 빼주면 멋지게 해결돼요!'

  return {
    hint: misconceptionHint || '계산 과정에서 올림/내림이나 수의 단위를 잠시 착각했을 수 있어요!',
    analogy: defaultAnalogy
  }
}

// Google Gemini 1.5 Flash 모델 기반 1:1 탐구 대화 생성
export async function generateAiChatResponse(
  userText: string,
  childName: string,
  dreamJob: string
): Promise<string> {
  const apiKey = getGeminiApiKey()

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

      const prompt = `너는 초등 3학년 아이의 따뜻한 AI 수학/탐구 선생님이야.
아이 이름: ${childName}
아이의 희망/꿈: ${dreamJob}
아이가 말한 설명 내용: "${userText}"

초등 3학년 눈높이에 맞게 적극적으로 칭찬해주고, 
아이의 꿈(${dreamJob})과 연결짓거나 스스로 생각해보도록 격려하는 다정한 응답 2문장을 작성해 줘. (~해요! 말투 사용)`

      const result = await model.generateContent(prompt)
      const text = result.response.text()
      if (text) return text
    } catch (e) {
      console.warn('Gemini Chat API call fallback:', e)
    }
  }

  // Fallback
  if (userText.includes('나누기') || userText.includes('조각') || userText.includes('나눗셈')) {
    return `와! ${childName} 어린이가 똑같이 나누어 담는 원리를 정말 근사하게 설명했네요! 🍕 피자 한 판을 친구들과 나눌 때 나눗셈을 쓰는 이유를 잘 파악했어요! 칭찬해요 ⭐`
  } else if (userText.includes('분수') || userText.includes('조각')) {
    return `맞아요! 전체를 똑같이 나눈 것 중 몇 조각인지 생각하는 분수의 개념을 훌륭하게 말해줬어요! 👏`
  }
  return `좋은 생각이에요! ${childName} 어린이가 ${dreamJob}의 꿈에 어울리는 멋진 언어로 설명을 해줬어요! 🌟 훌륭하게 미션을 수행했어요!`
}

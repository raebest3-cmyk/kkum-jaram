/**
 * §5.3 간격반복(SRS) — SM-2 계열 경량 버전
 */

export interface SRSState {
  intervalDays: number
  ease: number
}

export interface SRSResult {
  intervalDays: number
  ease: number
  nextReviewDate: Date
  isMastered: boolean // interval > 21일이면 정복으로 간주하여 큐 제거
}

export function calculateSRS(
  currentState: SRSState,
  isCorrect: boolean,
  currentDate: Date = new Date()
): SRSResult {
  let { intervalDays, ease } = currentState

  if (isCorrect) {
    intervalDays = Math.ceil(intervalDays * ease)
    ease = Math.min(ease + 0.1, 2.8)
  } else {
    intervalDays = 1
    ease = Math.max(ease - 0.2, 1.3)
  }

  const isMastered = intervalDays > 21

  const nextReviewDate = new Date(currentDate)
  nextReviewDate.setDate(nextReviewDate.getDate() + intervalDays)

  return {
    intervalDays,
    ease,
    nextReviewDate,
    isMastered,
  }
}

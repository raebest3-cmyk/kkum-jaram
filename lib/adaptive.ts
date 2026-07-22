/**
 * §5.2 적응형 난이도 규칙 (LLM 없이 규칙 기반)
 */

export function getInitialLevel(mastery: number): number {
  const level = Math.round(mastery * 4) + 1
  return Math.min(Math.max(level, 1), 5)
}

export interface AdaptiveState {
  currentLevel: number
  consecutiveCorrect: number
  hasRetriedSameDifficulty: boolean
}

export function updateAdaptiveLevel(
  state: AdaptiveState,
  isCorrect: boolean
): AdaptiveState {
  let { currentLevel, consecutiveCorrect, hasRetriedSameDifficulty } = state

  if (isCorrect) {
    consecutiveCorrect += 1
    if (consecutiveCorrect >= 2) {
      currentLevel += 1
      consecutiveCorrect = 0
    }
    hasRetriedSameDifficulty = false
  } else {
    consecutiveCorrect = 0
    if (!hasRetriedSameDifficulty) {
      // 동급 문항 1회 재노출
      hasRetriedSameDifficulty = true
    } else {
      // 재오답 시 레벨 -1
      currentLevel -= 1
      hasRetriedSameDifficulty = false
    }
  }

  // 레벨 1~5 Clamp
  currentLevel = Math.min(Math.max(currentLevel, 1), 5)

  return {
    currentLevel,
    consecutiveCorrect,
    hasRetriedSameDifficulty,
  }
}

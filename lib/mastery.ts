/**
 * §5.1 개념 숙달도 갱신 (지수이동평균)
 * mastery_new = clamp(mastery_old + α * (outcome - mastery_old), 0, 1)
 * α = 0.3
 */

export function calculateMastery(
  masteryOld: number,
  isCorrect: boolean,
  alpha: number = 0.3
): number {
  const outcome = isCorrect ? 1 : 0
  const masteryNew = masteryOld + alpha * (outcome - masteryOld)
  return Math.min(Math.max(masteryNew, 0), 1)
}

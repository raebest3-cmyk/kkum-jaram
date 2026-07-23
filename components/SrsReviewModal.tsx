'use client'

import React, { useState } from 'react'

interface SrsReviewModalProps {
  childName: string
  onClose: (earnedPoints: number) => void
}

interface ReviewQuestion {
  id: string
  conceptName: string
  stem: string
  choices: string[]
  correctIndex: number
  explanation: string
}

const REVIEW_QUESTIONS: ReviewQuestion[] = [
  {
    id: 'srs-1',
    conceptName: '분수의 크기 비교',
    stem: '1/4 과 1/6 중에서 더 큰 분수는 무엇일까요?',
    choices: ['1/4 이 더 크다', '1/6 이 더 크다', '두 분수의 크기는 같다'],
    correctIndex: 0,
    explanation: '똑같은 크기를 나누었을 때 조각 수가 적을수록 한 조각의 크기가 더 큽니다! (1/4 > 1/6)'
  },
  {
    id: 'srs-2',
    conceptName: '세 자리 수의 뺄셈',
    stem: '524 - 187 의 계산 결과는 얼마일까요?',
    choices: ['337', '347', '437'],
    correctIndex: 0,
    explanation: '일의 자리 4-7은 십의 자리에서 받아내림하여 14-7=7, 십의 자리는 11-8=3, 백의 자리는 4-1=3 이 되어 337이 됩니다.'
  }
]

export default function SrsReviewModal({ childName, onClose }: SrsReviewModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [defeatedCount, setDefeatedCount] = useState(0)

  const currentQ = REVIEW_QUESTIONS[currentIndex]

  const handleSelectChoice = (idx: number) => {
    if (isAnswered) return
    setSelectedChoice(idx)
    setIsAnswered(true)

    const correct = idx === currentQ.correctIndex
    setIsCorrect(correct)

    if (correct) {
      setDefeatedCount((prev) => prev + 1)
    }
  }

  const handleNext = () => {
    if (currentIndex + 1 < REVIEW_QUESTIONS.length) {
      setCurrentIndex((prev) => prev + 1)
      setSelectedChoice(null)
      setIsAnswered(false)
      setIsCorrect(false)
    } else {
      // 완료
      onClose(30)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-[#FDFBF7] rounded-3xl border-2 border-rose-300 shadow-2xl overflow-hidden flex flex-col">
        {/* 파스텔 로즈 헤더 */}
        <div className="bg-gradient-to-r from-rose-200 via-pink-100 to-rose-200 text-rose-950 px-6 py-4 flex justify-between items-center border-b border-rose-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-sm border border-rose-300">
              👾
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-rose-950 flex items-center gap-2">
                <span>오답 괴물 격파하기</span>
                <span className="text-xs font-bold bg-rose-300 text-rose-950 px-2 py-0.5 rounded-full">
                  자동 맞춤 복습
                </span>
              </h2>
              <p className="text-xs text-rose-800 font-extrabold">
                {childName} 어린이의 복습 몬스터 출현 ✦
              </p>
            </div>
          </div>

          <button
            onClick={() => onClose(0)}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-sm text-rose-900 font-black shadow-sm transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 복습 카드 진행 영역 */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {currentIndex < REVIEW_QUESTIONS.length ? (
            <>
              <div className="flex justify-between items-center text-xs font-black text-rose-800 bg-rose-50 px-4 py-2 rounded-2xl border border-rose-200">
                <span>단원: {currentQ.conceptName}</span>
                <span>
                  복습 진행 ({currentIndex + 1} / {REVIEW_QUESTIONS.length})
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border-2 border-rose-200/80 shadow-sm space-y-3">
                <span className="text-xs font-extrabold text-rose-600 bg-rose-100 px-2.5 py-0.5 rounded-full">
                  복습 문제 #{currentIndex + 1}
                </span>
                <h3 className="text-base font-black text-slate-900 leading-snug">
                  {currentQ.stem}
                </h3>
              </div>

              {/* 보기 선택 */}
              <div className="space-y-2.5">
                {currentQ.choices.map((choice, idx) => {
                  let btnStyle =
                    'bg-white border-2 border-slate-200 text-slate-800 hover:border-rose-300 hover:bg-rose-50/50'

                  if (isAnswered) {
                    if (idx === currentQ.correctIndex) {
                      btnStyle = 'bg-emerald-100 border-2 border-emerald-400 text-emerald-950 font-black'
                    } else if (idx === selectedChoice) {
                      btnStyle = 'bg-rose-100 border-2 border-rose-400 text-rose-950 font-black'
                    } else {
                      btnStyle = 'bg-slate-50 border border-slate-200 text-slate-400'
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isAnswered}
                      onClick={() => handleSelectChoice(idx)}
                      className={`w-full p-4 rounded-2xl text-left text-sm font-bold transition-all shadow-sm flex items-center justify-between ${btnStyle}`}
                    >
                      <span>
                        {idx + 1}. {choice}
                      </span>
                      {isAnswered && idx === currentQ.correctIndex && <span>🎯 정답!</span>}
                      {isAnswered && idx === selectedChoice && idx !== currentQ.correctIndex && (
                        <span>👾 격파 실패</span>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* 피드백 */}
              {isAnswered && (
                <div className="space-y-3 animate-fade-in">
                  <div
                    className={`p-4 rounded-2xl border text-xs font-bold leading-relaxed ${
                      isCorrect
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : 'bg-rose-50 border-rose-300 text-rose-900'
                    }`}
                  >
                    <p className="font-black text-sm mb-1">
                      {isCorrect ? '🎉 몬스터 격파 성공!' : '💡 몬스터 공격 방어 해설'}
                    </p>
                    <p>{currentQ.explanation}</p>
                  </div>

                  <button
                    onClick={handleNext}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-black text-sm shadow-md transition-transform hover:scale-105"
                  >
                    {currentIndex + 1 < REVIEW_QUESTIONS.length ? '다음 오답 몬스터 격파하기 →' : '⚔️ 복습 완료 및 보상받기'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-rose-100 flex items-center justify-center text-4xl mx-auto shadow-md border border-rose-300">
                🏆
              </div>
              <h3 className="text-xl font-black text-slate-900">
                {childName} 어린이가 복습 몬스터 {defeatedCount}마리를 모두 물리쳤어요!
              </h3>
              <p className="text-xs text-slate-500 font-bold">
                잊어버리기 쉬운 개념을 완벽하게 재복습하였습니다 (+30 P 정산)
              </p>
              <button
                onClick={() => onClose(30)}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black text-sm shadow-md hover:scale-105 transition-transform"
              >
                🎁 +30 P 받고 완료하기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import React, { useState, useEffect } from 'react'

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

  // 60초 제한시간 타이머 상태
  const [timeLeft, setTimeLeft] = useState<number>(60)
  const [showTimeoutModal, setShowTimeoutModal] = useState<boolean>(false)

  const currentQ = REVIEW_QUESTIONS[currentIndex]

  useEffect(() => {
    setTimeLeft(60)
    setShowTimeoutModal(false)

    if (isAnswered) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setShowTimeoutModal(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [currentIndex, isAnswered])

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
    if (currentIndex < REVIEW_QUESTIONS.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setSelectedChoice(null)
      setIsAnswered(false)
      setIsCorrect(false)
      setTimeLeft(60)
      setShowTimeoutModal(false)
    } else {
      onClose(defeatedCount * 20)
    }
  }

  const getTimerColorClass = () => {
    if (timeLeft > 30) return 'bg-emerald-500'
    if (timeLeft > 15) return 'bg-amber-500'
    return 'bg-rose-500 animate-pulse'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-[#FFF5F5] rounded-3xl border-2 border-rose-300 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-rose-400 via-pink-400 to-rose-500 text-white px-6 py-4 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shadow-inner">
              👾
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">오답 괴물 격파 복습 미션</h2>
              <p className="text-xs text-rose-100 font-extrabold">
                {childName} 어린이가 틀렸던 문제 다시 도전!
              </p>
            </div>
          </div>

          <button
            onClick={() => onClose(defeatedCount * 20)}
            className="text-white hover:bg-white/20 p-2 rounded-full font-black text-sm"
          >
            ✕
          </button>
        </div>

        {/* ⏱️ 시각적 제한시간 타이머 & Progress Bar */}
        <div className="bg-rose-100/70 px-6 py-2 border-b border-rose-200 flex flex-col gap-1">
          <div className="flex justify-between items-center text-xs font-black">
            <span className="text-rose-900 flex items-center gap-1">
              <span>⏱️ 복습 타이머</span>
              <span className={timeLeft <= 15 ? 'text-rose-600 font-black' : 'text-slate-800'}>
                ({timeLeft}초)
              </span>
            </span>
            <span className="text-rose-800 text-[11px]">
              {timeLeft > 30 ? '차근차근 풀어보세요 ⚔️' : '서둘러 괴물을 격파하세요! 🔥'}
            </span>
          </div>

          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden p-0.5 border border-rose-300">
            <div
              className={`h-full rounded-full transition-all duration-300 ${getTimerColorClass()}`}
              style={{ width: `${(timeLeft / 60) * 100}%` }}
            />
          </div>
        </div>

        {/* 본문 문제 영역 */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black bg-rose-200/80 text-rose-950 px-3 py-1 rounded-full border border-rose-300">
              약점 단원: {currentQ.conceptName}
            </span>
            <span className="text-xs font-bold text-rose-800">
              문제 {currentIndex + 1} / {REVIEW_QUESTIONS.length}
            </span>
          </div>

          <h3 className="text-lg font-black text-slate-900 leading-snug">{currentQ.stem}</h3>

          <div className="space-y-2.5">
            {currentQ.choices.map((choice, idx) => {
              const isSelected = selectedChoice === idx
              let btnStyle = 'bg-white hover:bg-rose-50 border-rose-200 text-slate-800'

              if (isAnswered) {
                if (idx === currentQ.correctIndex) {
                  btnStyle = 'bg-emerald-100 border-emerald-400 text-emerald-950 ring-2 ring-emerald-300 font-black'
                } else if (isSelected) {
                  btnStyle = 'bg-rose-200 border-rose-400 text-rose-950 font-black'
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => handleSelectChoice(idx)}
                  className={`w-full p-4 rounded-2xl border-2 text-left font-bold text-sm transition-all flex justify-between items-center shadow-sm ${btnStyle}`}
                >
                  <span>{choice}</span>
                  {isAnswered && idx === currentQ.correctIndex && (
                    <span className="text-xs bg-emerald-500 text-white font-black px-2.5 py-0.5 rounded-full">
                      격파 완료! ⚔️
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {isAnswered && (
            <div
              className={`p-4 rounded-2xl border text-xs font-bold leading-relaxed animate-fade-in ${
                isCorrect
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-rose-100/90 border-rose-300 text-rose-950'
              }`}
            >
              <div className="font-black text-sm mb-1">
                {isCorrect ? '🎉 오답 괴물 1마리 격파 성공!' : '💡 힌트 해설:'}
              </div>
              <p>{currentQ.explanation}</p>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="bg-rose-100/50 p-4 px-6 border-t border-rose-200 flex justify-between items-center">
          <span className="text-xs font-black text-rose-800">
            격파한 괴물: {defeatedCount} 마리 (보상 +{defeatedCount * 20} 조각)
          </span>

          {isAnswered ? (
            <button
              onClick={handleNext}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black text-xs shadow-md hover:scale-105 transition-transform"
            >
              {currentIndex < REVIEW_QUESTIONS.length - 1 ? '다음 오답 괴물 격파 →' : '복습 완료 🎉'}
            </button>
          ) : (
            <span className="text-xs text-rose-700 font-bold">정답을 골라 괴물을 퇴치해 주세요!</span>
          )}
        </div>

        {/* ⏱️ 시간 초과 안내 모달 */}
        {showTimeoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-sm bg-white rounded-3xl border-2 border-rose-300 p-6 shadow-2xl space-y-4 text-center">
              <div className="w-16 h-16 rounded-3xl bg-rose-100 flex items-center justify-center text-3xl mx-auto border border-rose-300">
                ⏱️
              </div>
              <h3 className="text-lg font-black text-slate-900">제한시간(60초) 초과!</h3>
              <p className="text-xs text-slate-600 font-bold leading-relaxed">
                시간이 지나 다음 문제로 이동하거나 다시 도전하실 수 있습니다.
              </p>

              <div className="flex justify-center gap-2 pt-2">
                <button
                  onClick={handleNext}
                  className="px-5 py-2 rounded-xl bg-rose-500 text-white font-black text-xs shadow-md"
                >
                  다음 문제로 이동 →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

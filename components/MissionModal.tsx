'use client'

import React, { useState, useEffect } from 'react'
import ScratchCanvas from './ScratchCanvas'
import AiDiagnosticModal from './AiDiagnosticModal'
import { QuestionItem } from '@/lib/questions'

interface MissionModalProps {
  questions: QuestionItem[]
  childName: string
  onClose: (earnedPoints: number) => void
}

export default function MissionModal({ questions, childName, onClose }: MissionModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<number, any>>({})
  const [showExplanation, setShowExplanation] = useState<boolean>(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)

  const [showScratch, setShowScratch] = useState<boolean>(false)
  const [showAiDiagnostic, setShowAiDiagnostic] = useState<boolean>(false)
  const [earnedPoints, setEarnedPoints] = useState<number>(0)

  // 60초 타이머 & 시간 초과 팝업 상태
  const [timeLeft, setTimeLeft] = useState<number>(60)
  const [showTimeoutModal, setShowTimeoutModal] = useState<boolean>(false)

  const currentQ = questions[currentIndex] || questions[0]
  const isLast = currentIndex === questions.length - 1

  // 주관식/단답형 입력 상태
  const [shortValue, setShortValue] = useState('')

  // 문제 변경 및 해설 표시 여부에 따른 타이머 초기화
  useEffect(() => {
    setTimeLeft(60)
    setShowTimeoutModal(false)

    if (showExplanation) return

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
  }, [currentIndex, showExplanation])

  const handleSelectChoice = (choiceIndex: number) => {
    if (showExplanation) return
    const correct = currentQ.answer.correct_index === choiceIndex
    setIsCorrect(correct)
    setUserAnswers((prev) => ({ ...prev, [currentIndex]: choiceIndex }))
    setShowExplanation(true)
    if (correct) {
      setEarnedPoints((prev) => prev + 5)
    }
  }

  const handleSubmitShort = () => {
    if (showExplanation || !shortValue.trim()) return
    const correct = String(currentQ.answer.value).trim() === shortValue.trim()
    setIsCorrect(correct)
    setUserAnswers((prev) => ({ ...prev, [currentIndex]: shortValue.trim() }))
    setShowExplanation(true)
    if (correct) {
      setEarnedPoints((prev) => prev + 5)
    }
  }

  const handleNext = () => {
    if (isLast) {
      onClose(50) // 10문항 완주 시 보상 +50 조각
    } else {
      setCurrentIndex((prev) => prev + 1)
      setShowExplanation(false)
      setIsCorrect(null)
      setShortValue('')
      setTimeLeft(60)
      setShowTimeoutModal(false)
    }
  }

  // 시간 경과에 따른 동적 타이머 색상
  const getTimerColorClass = () => {
    if (timeLeft > 30) return 'bg-emerald-500'
    if (timeLeft > 15) return 'bg-amber-500'
    return 'bg-rose-500 animate-pulse'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-[#FDFBF7] rounded-3xl border-2 border-amber-300 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* 파스텔 헤더 */}
        <div className="bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 text-amber-950 px-6 py-4 flex justify-between items-center border-b border-amber-300 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-sm border border-amber-300">
              ✏️
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-amber-950">
                오늘의 수학 10문항 도전!
              </h2>
              <p className="text-xs text-amber-800 font-extrabold">
                {childName} 어린이의 탐구 학습 세션 ✦
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs bg-amber-400/80 text-amber-950 px-3 py-1.5 rounded-full font-black shadow-sm">
              문제 {currentIndex + 1} / {questions.length}
            </span>
            <button
              onClick={() => onClose(0)}
              className="text-amber-950 hover:bg-amber-300/50 p-2 rounded-full font-black text-sm"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ⏱️ 시각적 제한시간 타이머 & Progress Bar */}
        <div className="bg-amber-50/80 px-6 py-2 border-b border-amber-200 flex flex-col gap-1">
          <div className="flex justify-between items-center text-xs font-black">
            <span className="text-slate-600 flex items-center gap-1">
              <span>⏱️ 제한시간</span>
              <span className={timeLeft <= 15 ? 'text-rose-600 font-black' : 'text-slate-800'}>
                ({timeLeft}초)
              </span>
            </span>
            <span className="text-amber-800 text-[11px]">
              {timeLeft > 30 ? '여유있게 풀어보세요 😊' : timeLeft > 15 ? '조금 서둘러 주세요! ⚡' : '시간이 얼마 남지 않았어요! 🔥'}
            </span>
          </div>

          {/* 동적 Progress Bar */}
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-300">
            <div
              className={`h-full rounded-full transition-all duration-300 ${getTimerColorClass()}`}
              style={{ width: `${(timeLeft / 60) * 100}%` }}
            />
          </div>
        </div>

        {/* 메인 문제 및 선택지 영역 */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-amber-100/80 text-amber-900 border border-amber-300 px-3 py-1 rounded-full text-xs font-extrabold">
              <span>개념: {currentQ.concept_name || '세 자리 수의 덧셈'}</span>
              <span>⭐ 레벨 {currentQ.difficulty || 1}</span>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
              {currentQ.body?.stem || '345 + 234 의 계산 결과는 얼마일까요?'}
            </h3>
          </div>

          {/* 객관식 4지선다 선택지 */}
          {currentQ.qtype !== 'short' && currentQ.body?.choices ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {currentQ.body.choices.map((choice, idx) => {
                const isSelected = userAnswers[currentIndex] === idx
                let buttonStyle = 'bg-white hover:bg-amber-50 border-slate-200 text-slate-800'

                if (showExplanation) {
                  if (idx === currentQ.answer.correct_index) {
                    buttonStyle = 'bg-emerald-100 border-emerald-400 text-emerald-950 ring-2 ring-emerald-300'
                  } else if (isSelected) {
                    buttonStyle = 'bg-rose-100 border-rose-400 text-rose-950 ring-2 ring-rose-300'
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={showExplanation}
                    onClick={() => handleSelectChoice(idx)}
                    className={`p-4 rounded-2xl border-2 text-left font-bold text-sm sm:text-base transition-all flex items-center justify-between shadow-sm hover:scale-[1.01] ${buttonStyle}`}
                  >
                    <span>
                      <strong className="mr-2 text-amber-700 font-black">{idx + 1}.</strong>
                      {choice}
                    </span>
                    {showExplanation && idx === currentQ.answer.correct_index && (
                      <span className="text-xs bg-emerald-500 text-white font-black px-2.5 py-1 rounded-full">
                        정답 ✓
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          ) : (
            /* 주관식/단답형 입력 영역 */
            <div className="space-y-3 pt-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  disabled={showExplanation}
                  placeholder="정답 수치를 입력하세요..."
                  value={shortValue}
                  onChange={(e) => setShortValue(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-2xl border-2 border-slate-300 font-black text-base text-slate-900 focus:outline-none focus:border-amber-400"
                />
                <button
                  disabled={showExplanation || !shortValue.trim()}
                  onClick={handleSubmitShort}
                  className="px-6 py-3 bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-sm rounded-2xl shadow-md transition-transform hover:scale-105 disabled:opacity-50"
                >
                  제출
                </button>
              </div>
            </div>
          )}

          {/* 해설 및 AI 피드백 결과 */}
          {showExplanation && (
            <div
              className={`p-5 rounded-3xl border-2 animate-fade-in space-y-3 ${
                isCorrect
                  ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                  : 'bg-rose-50/90 border-rose-300 text-rose-950'
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{isCorrect ? '🎉' : '💡'}</span>
                  <h4 className="text-base font-black">
                    {isCorrect ? '정답입니다! 훌륭해요!' : '아쉽네요! AI 해설을 확인해 보세요.'}
                  </h4>
                </div>

                {!isCorrect && (
                  <button
                    onClick={() => setShowAiDiagnostic(true)}
                    className="px-3.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-black text-xs shadow-md flex items-center gap-1"
                  >
                    <span>🔊 AI 처방전 들어가기</span>
                  </button>
                )}
              </div>

              <p className="text-xs font-bold leading-relaxed border-t border-slate-200/60 pt-2">
                {currentQ.answer?.explanation || '각 자리별로 차근차근 덧셈 원리를 적용해 줍니다.'}
              </p>
            </div>
          )}
        </div>

        {/* 푸터 하단 컨트롤 */}
        <div className="bg-amber-100/50 p-4 px-6 border-t border-amber-200 flex justify-between items-center">
          <button
            onClick={() => setShowScratch(!showScratch)}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs border transition-transform hover:scale-105 flex items-center gap-1.5 shadow-sm ${
              showScratch
                ? 'bg-amber-500 text-white border-amber-600'
                : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-100'
            }`}
          >
            <span>✏️</span>
            <span>{showScratch ? '펜 연습장 닫기' : '펜 연습장(Scratch) 열기'}</span>
          </button>

          {showExplanation ? (
            <button
              onClick={handleNext}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-amber-950 font-black text-xs shadow-md hover:scale-105 transition-transform"
            >
              {isLast ? '🎉 10문항 완주 완료 (+50 조각)' : '다음 문제 도전하기 →'}
            </button>
          ) : (
            <span className="text-xs text-slate-500 font-bold">정답을 선택하면 해설이 열립니다</span>
          )}
        </div>

        {/* Scratch Canvas 펜 연습장 모달 */}
        {showScratch && (
          <div className="absolute inset-0 z-40 bg-white/95 p-4 flex flex-col animate-fade-in">
            <ScratchCanvas onClose={() => setShowScratch(false)} />
          </div>
        )}

        {/* AI 오답 처방전 🔊 TTS 모달 */}
        {showAiDiagnostic && (
          <AiDiagnosticModal
            question={currentQ}
            userChoiceIndex={userAnswers[currentIndex]}
            childName={childName}
            onClose={() => setShowAiDiagnostic(false)}
          />
        )}

        {/* ⏱️ 제한시간 초과 안내 모달 */}
        {showTimeoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-sm bg-white rounded-3xl border-2 border-rose-300 p-6 shadow-2xl space-y-4 text-center">
              <div className="w-16 h-16 rounded-3xl bg-rose-100 flex items-center justify-center text-3xl mx-auto border border-rose-300">
                ⏱️
              </div>
              <h3 className="text-lg font-black text-slate-900">제한시간(60초) 초과!</h3>
              <p className="text-xs text-slate-600 font-bold leading-relaxed">
                시간 초과! 다음 문제로 이동하거나 AI 힌트를 확인해 보세요.
              </p>

              <div className="flex justify-center gap-2 pt-2">
                <button
                  onClick={() => {
                    setShowTimeoutModal(false)
                    setShowAiDiagnostic(true)
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-xs border border-amber-300 shadow-sm"
                >
                  💡 AI 힌트 보기
                </button>
                <button
                  onClick={handleNext}
                  className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs shadow-md"
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

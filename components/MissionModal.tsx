'use client'

import React, { useState } from 'react'
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

  const currentQ = questions[currentIndex] || questions[0]
  const isLast = currentIndex === questions.length - 1

  // 주관식/단답형 입력 상태
  const [shortValue, setShortValue] = useState('')

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
      onClose(50) // 10문항 완주 시 보상 +50 P
    } else {
      setCurrentIndex((prev) => prev + 1)
      setShowExplanation(false)
      setIsCorrect(null)
      setShortValue('')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-[#FDFBF7] rounded-3xl border-2 border-amber-300 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* 밝고 귀여운 파스텔 헤더 */}
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

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowScratch(!showScratch)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 shadow-sm ${
                showScratch
                  ? 'bg-amber-500 text-amber-950 scale-105'
                  : 'bg-white text-amber-900 border border-amber-300 hover:bg-amber-100'
              }`}
            >
              <span>✏️</span>
              <span>{showScratch ? '연습장 닫기' : '연습장 열기'}</span>
            </button>

            <button
              onClick={() => onClose(0)}
              className="w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-sm text-amber-900 font-black shadow-sm transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 진행 상태 바 */}
        <div className="bg-amber-50/80 px-6 py-2 border-b border-amber-200/60 flex items-center justify-between text-xs font-black text-amber-900">
          <span>
            문제 {currentIndex + 1} / {questions.length}
          </span>
          <div className="w-48 bg-white h-2.5 rounded-full overflow-hidden border border-amber-200 p-0.5">
            <div
              className="bg-gradient-to-r from-amber-400 to-yellow-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
          <span>개념: {currentQ.concept_name}</span>
        </div>

        {/* 메인 문제 카드 영역 */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* 연습장 패널 (토글) */}
          {showScratch && <ScratchCanvas />}

          {/* 문제 텍스트 */}
          <div className="bg-white rounded-3xl p-6 border-2 border-amber-200/80 shadow-md space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-amber-800 bg-amber-100/80 px-3 py-1 rounded-full border border-amber-200">
                Q{currentIndex + 1}. {currentQ.concept_name}
              </span>
              <span className="text-xs font-bold text-slate-400">
                {currentQ.qtype === 'mcq' ? '객관식 (택1)' : '단답형 풀이'}
              </span>
            </div>

            <h3 className="text-xl font-black text-slate-900 leading-snug tracking-tight">
              {currentQ.body.stem}
            </h3>
          </div>

          {/* 객관식 보기 또는 주간식 입력창 */}
          {currentQ.qtype === 'mcq' ? (
            <div className="grid grid-cols-1 gap-3">
              {currentQ.body.choices?.map((choice, idx) => {
                let btnStyle =
                  'bg-white border-2 border-slate-200 text-slate-800 hover:border-amber-400 hover:bg-amber-50/50'

                if (showExplanation) {
                  if (idx === currentQ.answer.correct_index) {
                    btnStyle =
                      'bg-emerald-100 border-2 border-emerald-400 text-emerald-950 font-black shadow-md'
                  } else if (idx === userAnswers[currentIndex]) {
                    btnStyle =
                      'bg-rose-100 border-2 border-rose-400 text-rose-950 font-black shadow-md'
                  } else {
                    btnStyle = 'bg-slate-50 border border-slate-200 text-slate-400 opacity-60'
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={showExplanation}
                    onClick={() => handleSelectChoice(idx)}
                    className={`p-4 rounded-2xl text-left text-base font-bold transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <span>
                      {idx + 1}. {choice}
                    </span>
                    {showExplanation && idx === currentQ.answer.correct_index && (
                      <span className="text-emerald-700 font-black text-sm bg-emerald-200 px-3 py-1 rounded-full">
                        🎯 정답!
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="bg-white p-5 rounded-2xl border-2 border-amber-200 space-y-3">
              <label className="text-xs font-black text-amber-900 block">
                정답을 아래 상자에 입력하세요:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  disabled={showExplanation}
                  value={shortValue}
                  onChange={(e) => setShortValue(e.target.value)}
                  placeholder="예: 337"
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-300 text-base font-bold focus:outline-none focus:border-amber-400"
                />
                <button
                  disabled={showExplanation || !shortValue.trim()}
                  onClick={handleSubmitShort}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 font-black text-sm shadow-md hover:scale-105 transition-transform disabled:opacity-50"
                >
                  제출하기
                </button>
              </div>
            </div>
          )}

          {/* 피드백 및 해설 카드 */}
          {showExplanation && (
            <div className="space-y-4 animate-fade-in pt-2">
              <div
                className={`p-5 rounded-3xl border-2 shadow-sm space-y-3 ${
                  isCorrect
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-rose-50 border-rose-300 text-rose-950'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-lg font-black flex items-center gap-2">
                    <span>{isCorrect ? '🎉 딩동댕! 정답입니다!' : '💡 아쉬워요! 원리를 다져볼까요?'}</span>
                  </span>

                  {!isCorrect && (
                    <button
                      onClick={() => setShowAiDiagnostic(true)}
                      className="px-4 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs shadow-md transition-transform hover:scale-105 flex items-center gap-1"
                    >
                      <span>🧠 Gemini AI 처방전 보기</span>
                      <span>→</span>
                    </button>
                  )}
                </div>

                <p className="text-sm font-bold leading-relaxed border-t border-slate-200/60 pt-3">
                  {currentQ.answer.explanation}
                </p>
              </div>

              {/* 다음 문제 버튼 */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleNext}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-amber-950 font-black text-sm shadow-md hover:scale-105 transition-transform flex items-center gap-2"
                >
                  <span>{isLast ? '🎉 10문항 완료 및 +50 P 받기' : '다음 문제 도전하기'}</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showAiDiagnostic && (
        <AiDiagnosticModal
          question={currentQ}
          userChoiceIndex={userAnswers[currentIndex]}
          childName={childName}
          onClose={() => setShowAiDiagnostic(false)}
        />
      )}
    </div>
  )
}

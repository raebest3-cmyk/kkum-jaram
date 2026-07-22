'use client'

import React, { useState, useEffect } from 'react'
import { QuestionItem, recordMissionCompletion } from '@/lib/questions'
import ScratchCanvas from './ScratchCanvas'
import AiDiagnosticModal from './AiDiagnosticModal'

interface MissionModalProps {
  questions: QuestionItem[]
  childName: string
  onClose: (earnedPoints: number) => void
}

export default function MissionModal({ questions, childName, onClose }: MissionModalProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null)
  const [shortAnswer, setShortAnswer] = useState<string>('')

  // 연습장 및 AI 진단 모달 상태
  const [showScratch, setShowScratch] = useState<boolean>(false)
  const [showAiDiagnostic, setShowAiDiagnostic] = useState<boolean>(false)

  // 제출 후 채점 상태
  const [isAnswered, setIsAnswered] = useState<boolean>(false)
  const [isCorrect, setIsCorrect] = useState<boolean>(false)
  const [feedbackMsg, setFeedbackMsg] = useState<string>('')
  const [startTime, setStartTime] = useState<number>(Date.now())

  // 풀이 결과 기록 리스트
  const [userResults, setUserResults] = useState<
    Array<{ question: QuestionItem; isCorrect: boolean; userResponse: any; latencyMs: number }>
  >([])

  // 완주 상태
  const [isFinished, setIsFinished] = useState<boolean>(false)

  const currentQ = questions[currentIndex]

  useEffect(() => {
    setStartTime(Date.now())
  }, [currentIndex])

  if (!currentQ && !isFinished) {
    return null
  }

  // 문제 제출 처리
  const handleSubmitAnswer = () => {
    if (isAnswered) return

    const latencyMs = Date.now() - startTime
    let correct = false
    let userResp: any = null
    let hint = ''

    if (currentQ.qtype === 'mcq') {
      if (selectedChoice === null) {
        alert('답안을 선택해 주세요!')
        return
      }
      userResp = selectedChoice
      correct = selectedChoice === currentQ.answer.correct_index

      if (!correct && currentQ.misconception_map) {
        hint = currentQ.misconception_map[String(selectedChoice)] || ''
      }
    } else {
      if (!shortAnswer.trim()) {
        alert('정답을 입력해 주세요!')
        return
      }
      userResp = shortAnswer.trim()
      correct = userResp === currentQ.answer.value
    }

    setIsCorrect(correct)
    setIsAnswered(true)

    if (correct) {
      setFeedbackMsg('정답이에요! 참 잘했어요 👏✨ 완벽하게 요리 성공!')
    } else {
      if (hint) {
        setFeedbackMsg(`💡 오개념 힌트: ${hint}`)
      } else {
        setFeedbackMsg('아쉬워요! 원리를 차근차근 다시 살펴볼까요?')
      }
    }

    setUserResults((prev) => [
      ...prev,
      {
        question: currentQ,
        isCorrect: correct,
        userResponse: userResp,
        latencyMs
      }
    ])
  }

  // 다음 문제로 이동
  const handleNextQuestion = async () => {
    setSelectedChoice(null)
    setShortAnswer('')
    setIsAnswered(false)
    setFeedbackMsg('')

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      setIsFinished(true)
      await recordMissionCompletion('subin-demo', userResults)
    }
  }

  const correctCount = userResults.filter((r) => r.isCorrect).length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-[#FDFBF7] rounded-3xl border-2 border-amber-300 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* 파스텔 오렌지/옐로우 헤더 */}
        <div className="bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 text-amber-950 px-6 py-4 flex justify-between items-center border-b border-amber-300/80 relative shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/90 flex items-center justify-center text-2xl shadow-sm border border-amber-300">
              🍳
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-amber-950">
                오늘의 수학 10문항 레시피
              </h2>
              <p className="text-xs text-amber-800 font-extrabold">
                {childName} 요리사의 지식 요리 중 ✦
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isFinished && (
              <button
                onClick={() => setShowScratch(!showScratch)}
                className={`px-3 py-1.5 rounded-full text-xs font-black transition-all shadow-sm flex items-center gap-1 border ${
                  showScratch
                    ? 'bg-amber-400 text-amber-950 border-amber-500 scale-105'
                    : 'bg-white/90 text-amber-900 border-amber-300 hover:bg-white'
                }`}
              >
                <span>✏️</span>
                <span>연습장 {showScratch ? '닫기' : '열기'}</span>
              </button>
            )}

            <button
              onClick={() => onClose(0)}
              className="w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-sm text-amber-900 font-black shadow-sm transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 완주 결과 화면 */}
        {isFinished ? (
          <div className="p-8 text-center space-y-6 overflow-y-auto">
            <div className="inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-amber-100 text-5xl border-2 border-amber-300 shadow-md animate-bounce">
              🎉
            </div>

            <div>
              <h3 className="text-3xl font-black text-slate-900">
                축하해요! 미션 10문항 완주!
              </h3>
              <p className="text-sm text-slate-600 mt-1 font-bold">
                {childName} 요리사가 10가지 수학 지식 재료를 완벽하게 완성했어요!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="bg-emerald-50 rounded-3xl p-5 border-2 border-emerald-200 text-center shadow-sm">
                <p className="text-xs font-black text-emerald-700">맞힌 문제</p>
                <p className="text-3xl font-black text-emerald-800 mt-1">
                  {correctCount} / {questions.length}개
                </p>
              </div>

              <div className="bg-amber-50 rounded-3xl p-5 border-2 border-amber-200 text-center shadow-sm">
                <p className="text-xs font-black text-amber-700">획득 보상</p>
                <p className="text-3xl font-black text-amber-600 mt-1 flex items-center justify-center gap-1">
                  <span>🪙</span>
                  <span>+50 P</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => onClose(50)}
              className="w-full max-w-md py-4 rounded-2xl bg-gradient-to-r from-[#0D8A68] to-emerald-500 hover:from-[#0b7457] hover:to-emerald-600 text-white font-black text-base shadow-lg transition-transform hover:scale-[1.02]"
            >
              🌱 완료하고 대시보드로 돌아가기
            </button>
          </div>
        ) : (
          /* 문제 진행 화면 */
          <div className="p-6 sm:p-8 flex-1 overflow-y-auto space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-black">
                <span className="text-[#00205b] bg-amber-100/80 px-3.5 py-1 rounded-full border border-amber-200">
                  개념: {currentQ.concept_name}
                </span>
                <span className="text-amber-900 font-black">
                  {currentIndex + 1} / {questions.length} 문항
                </span>
              </div>

              <div className="w-full bg-slate-200/80 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-300/60">
                <div
                  className="bg-gradient-to-r from-amber-400 via-yellow-400 to-emerald-500 h-full rounded-full transition-all duration-300 shadow-inner"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {showScratch && <ScratchCanvas />}

            <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-amber-200/80 shadow-md space-y-3">
              <div className="flex items-center gap-2">
                <span className="bg-amber-100 text-amber-900 text-xs font-black px-3 py-0.5 rounded-full">
                  난이도 LV.{currentQ.difficulty}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug tracking-tight">
                Q{currentIndex + 1}. {currentQ.body.stem}
              </h3>
            </div>

            {currentQ.qtype === 'mcq' && currentQ.body.choices && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {currentQ.body.choices.map((choice, idx) => {
                  const isSelected = selectedChoice === idx
                  let btnStyle =
                    'bg-white text-slate-800 border-slate-200 hover:border-amber-400 hover:bg-amber-50/50'

                  if (isAnswered) {
                    if (idx === currentQ.answer.correct_index) {
                      btnStyle = 'bg-emerald-100 border-emerald-400 text-emerald-950 font-black ring-4 ring-emerald-200 scale-[1.02]'
                    } else if (isSelected) {
                      btnStyle = 'bg-rose-100 border-rose-400 text-rose-950 font-black'
                    }
                  } else if (isSelected) {
                    btnStyle = 'bg-amber-100 border-amber-400 text-amber-950 font-black ring-4 ring-amber-200'
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isAnswered}
                      onClick={() => setSelectedChoice(idx)}
                      className={`p-4 sm:p-5 rounded-2xl border-2 text-left text-base transition-all shadow-sm flex items-center gap-3.5 ${btnStyle}`}
                    >
                      <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 font-black flex items-center justify-center text-sm shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-extrabold">{choice}</span>
                    </button>
                  )
                })}
              </div>
            )}

            {currentQ.qtype === 'short' && (
              <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm space-y-2">
                <label className="block text-xs font-bold text-slate-600">정답 입력</label>
                <input
                  type="text"
                  disabled={isAnswered}
                  placeholder="정답을 숫자로 입력해 주세요"
                  value={shortAnswer}
                  onChange={(e) => setShortAnswer(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-lg font-black focus:outline-none focus:border-amber-400"
                />
              </div>
            )}

            {/* 정답/오답 피드백 및 AI 진단 팝업 버튼 */}
            {isAnswered && (
              <div
                className={`p-5 rounded-3xl border-2 font-bold text-base shadow-md animate-bounce flex justify-between items-center ${
                  isCorrect
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-amber-50 border-amber-300 text-amber-950'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{isCorrect ? '🎉 🎆' : '💡'}</span>
                  <div>
                    <p className="font-black text-lg">{feedbackMsg}</p>
                  </div>
                </div>

                {!isCorrect && (
                  <button
                    onClick={() => setShowAiDiagnostic(true)}
                    className="px-3.5 py-2 rounded-xl bg-white text-amber-900 font-black text-xs border border-amber-300 shadow-sm hover:scale-105 transition-transform shrink-0"
                  >
                    🧠 AI 처방전 보기 →
                  </button>
                )}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              {!isAnswered ? (
                <button
                  onClick={handleSubmitAnswer}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-amber-950 font-black text-base shadow-lg transition-all hover:scale-105"
                >
                  정답 제출하기 ✨
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#0D8A68] to-emerald-500 hover:from-[#0b7457] hover:to-emerald-600 text-white font-black text-base shadow-lg transition-all hover:scale-105"
                >
                  {currentIndex + 1 < questions.length ? '다음 문제로 →' : '미션 완주 결과 보기 🏆'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* AI 눈높이 오답 진단 팝업 */}
      {showAiDiagnostic && (
        <AiDiagnosticModal
          question={currentQ}
          userChoiceIndex={selectedChoice !== null ? selectedChoice : undefined}
          userShortValue={shortAnswer}
          childName={childName}
          onClose={() => setShowAiDiagnostic(false)}
        />
      )}
    </div>
  )
}

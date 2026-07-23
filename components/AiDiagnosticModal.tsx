'use client'

import React, { useState, useEffect } from 'react'
import { QuestionItem } from '@/lib/questions'
import { generateDiagnosticPrescription } from '@/lib/gemini'

interface AiDiagnosticModalProps {
  question: QuestionItem
  userChoiceIndex?: number
  userShortValue?: string
  childName: string
  onClose: () => void
}

export default function AiDiagnosticModal({
  question,
  userChoiceIndex,
  userShortValue,
  childName,
  onClose
}: AiDiagnosticModalProps) {
  const [isPlayingTts, setIsPlayingTts] = useState<boolean>(false)
  const [loadingAi, setLoadingAi] = useState<boolean>(true)

  // Gemini 1.5 Flash 생성 처방전 텍스트
  const [hintText, setHintText] = useState<string>('')
  const [analogyText, setAnalogyText] = useState<string>('')

  useEffect(() => {
    async function loadGeminiPrescription() {
      setLoadingAi(true)
      const { hint, analogy } = await generateDiagnosticPrescription(
        question,
        userChoiceIndex,
        childName
      )
      setHintText(hint)
      setAnalogyText(analogy)
      setLoadingAi(false)
    }

    loadGeminiPrescription()

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [question, userChoiceIndex, childName])

  const fullSpeechText = `${childName} 어린이를 위한 Gemini AI 맞춤 처방전입니다. 착각 포인트: ${hintText}. 쉬운 원리 해설: ${analogyText}`

  // 🔊 TTS 음성 읽기 토글
  const toggleTtsSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('사용 중이신 브라우저에서는 음성 읽기(TTS)를 지원하지 않습니다.')
      return
    }

    if (isPlayingTts) {
      window.speechSynthesis.cancel()
      setIsPlayingTts(false)
    } else {
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(fullSpeechText)
      utterance.lang = 'ko-KR'
      utterance.rate = 0.9
      utterance.pitch = 1.1

      utterance.onend = () => {
        setIsPlayingTts(false)
      }

      utterance.onerror = () => {
        setIsPlayingTts(false)
      }

      window.speechSynthesis.speak(utterance)
      setIsPlayingTts(true)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-[#FDFBF7] rounded-3xl border-2 border-amber-300 shadow-2xl overflow-hidden flex flex-col">
        {/* Gemini 파스텔 헤더 */}
        <div className="bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 text-amber-950 px-6 py-4 flex justify-between items-center border-b border-amber-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-sm border border-amber-300">
              ✨
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-amber-950 flex items-center gap-1.5">
                <span>Gemini AI 오답 처방전</span>
                <span className="text-[10px] font-black bg-[#003087] text-white px-2 py-0.5 rounded-full">
                  Gemini 1.5 Flash ⚡
                </span>
              </h2>
              <p className="text-xs text-amber-800 font-extrabold">
                {childName} 어린이를 위한 맞춤 원리 해설 ✦
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel()
              }
              onClose()
            }}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-sm text-amber-900 font-black shadow-sm transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 오답 분석 내용 */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* 🔊 TTS 음성 읽기 실행 버튼 */}
          <div className="flex justify-between items-center bg-amber-100/70 p-3 rounded-2xl border border-amber-200">
            <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
              <span>🔊</span>
              <span>AI 음성 읽기 처방전</span>
            </span>

            <button
              onClick={toggleTtsSpeech}
              disabled={loadingAi}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm ${
                isPlayingTts
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-white text-amber-950 border border-amber-300 hover:bg-amber-50 disabled:opacity-50'
              }`}
            >
              <span>{isPlayingTts ? '⏹️ 정지' : '🔊 처방전 소리로 듣기'}</span>
            </button>
          </div>

          {loadingAi ? (
            <div className="py-8 text-center space-y-2">
              <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-amber-800">
                ✨ Google Gemini 1.5 Flash가 수빈이 맞춤 오답 처방전을 생성 중...
              </p>
            </div>
          ) : (
            <>
              {/* 착각 포인트 */}
              <div className="bg-rose-50 rounded-2xl p-4 border border-rose-200 space-y-2">
                <div className="flex items-center gap-2 text-rose-800 font-black text-xs">
                  <span>⚠️</span>
                  <span>내가 고른 답에서 생긴 착각 포인트</span>
                </div>
                <p className="text-sm font-extrabold text-slate-800 leading-relaxed">
                  {hintText}
                </p>
              </div>

              {/* Gemini 1.5 Flash 맞춤 해설 */}
              <div className="bg-white rounded-2xl p-5 border-2 border-amber-200/80 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-800 font-black text-xs bg-amber-100/70 px-3 py-1 rounded-full w-fit">
                    <span>💡</span>
                    <span>Gemini AI 쉬운 원리 해설</span>
                  </div>
                </div>

                <div className="text-sm text-slate-700 font-bold leading-relaxed space-y-2">
                  <p className="text-slate-900 font-black">
                    개념: {question.concept_name}
                  </p>
                  <p className="text-slate-700 font-medium whitespace-pre-line">
                    {analogyText}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* 정답 안내 */}
          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 flex justify-between items-center text-xs font-black">
            <span className="text-emerald-800">올바른 정답</span>
            <span className="text-emerald-900 bg-white px-3 py-1 rounded-full border border-emerald-300">
              {question.qtype === 'mcq'
                ? `${question.answer.correct_index! + 1}번 (${question.body.choices![question.answer.correct_index!]})`
                : question.answer.value}
            </span>
          </div>

          <button
            onClick={() => {
              if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel()
              }
              onClose()
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-amber-950 font-black text-sm shadow-md transition-transform hover:scale-105"
          >
            🌱 원리 이해 완료! 다음 문제로 가기
          </button>
        </div>
      </div>
    </div>
  )
}

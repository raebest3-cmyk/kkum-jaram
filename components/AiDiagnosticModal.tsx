'use client'

import React from 'react'
import { QuestionItem } from '@/lib/questions'

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
  let misconceptionHint = ''
  if (userChoiceIndex !== undefined && question.misconception_map) {
    misconceptionHint = question.misconception_map[String(userChoiceIndex)] || ''
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-[#FDFBF7] rounded-3xl border-2 border-amber-300 shadow-2xl overflow-hidden flex flex-col">
        {/* 파스텔 헤더 */}
        <div className="bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 text-amber-950 px-6 py-4 flex justify-between items-center border-b border-amber-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-sm border border-amber-300">
              🧠
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-amber-950">
                AI 눈높이 오답 노트 처방전
              </h2>
              <p className="text-xs text-amber-800 font-extrabold">
                {childName} 요리사를 위한 원리 맞춤 해설 ✦
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-sm text-amber-900 font-black shadow-sm transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 오답 분석 내용 */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* 오답 원인 분석 카트 */}
          <div className="bg-rose-50 rounded-2xl p-4 border border-rose-200 space-y-2">
            <div className="flex items-center gap-2 text-rose-800 font-black text-xs">
              <span>⚠️</span>
              <span>내가 고른 답에서 생긴 착각 포인트</span>
            </div>
            <p className="text-sm font-extrabold text-slate-800 leading-relaxed">
              {misconceptionHint || '계산 과정에서 올림/내림이나 수의 단위를 잠시 착각했을 수 있어요!'}
            </p>
          </div>

          {/* AI 원리 쉬운 해설 카트 */}
          <div className="bg-white rounded-2xl p-5 border-2 border-amber-200/80 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-amber-800 font-black text-xs bg-amber-100/70 px-3 py-1 rounded-full w-fit">
              <span>🍳</span>
              <span>쉬운 요리 비유 원리 해설</span>
            </div>

            <div className="text-sm text-slate-700 font-bold leading-relaxed space-y-2">
              <p>
                <strong>개념: {question.concept_name}</strong>
              </p>
              <p className="text-slate-600 font-medium">
                {question.concept_code.includes('FRAC')
                  ? '피자 한 판을 똑같이 나눈 조각의 개수가 분모가 되고, 내가 먹은 조각 수가 분자가 되는 원리와 같아요!'
                  : question.concept_code.includes('DIV')
                  ? '쿠키 12개를 4개의 그릇에 똑같이 나누어 담으면 한 그릇에 3개씩 들어가는 것이 나눗셈이에요!'
                  : '세 자리 수 계산은 일의 자리, 십의 자리, 백의 자리를 차례대로 차근차근 더하거나 빼주면 돼요!'}
              </p>
            </div>
          </div>

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
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-amber-950 font-black text-sm shadow-md transition-transform hover:scale-105"
          >
            🌱 원리 이해 완료! 다음 문제로 가기
          </button>
        </div>
      </div>
    </div>
  )
}

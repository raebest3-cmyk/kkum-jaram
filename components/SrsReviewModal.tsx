'use client'

import React, { useState } from 'react'
import { calculateSRS } from '@/lib/srs'
import { QuestionItem } from '@/lib/questions'

interface SrsReviewModalProps {
  childName: string
  onClose: (earnedPoints: number) => void
}

const REVIEW_MONSTERS: QuestionItem[] = [
  {
    id: 'monster-1',
    concept_id: 'c-frac-cmp',
    concept_code: 'MATH-G3-FRAC-CMP',
    concept_name: '분수의 크기 비교',
    difficulty: 2,
    qtype: 'mcq',
    body: { stem: '단위분수 1/4 과 1/6 의 크기 비교로 옳은 것은 무엇인가요?', choices: ['1/4 > 1/6', '1/4 < 1/6', '1/4 = 1/6', '비교할 수 없다'] },
    answer: { correct_index: 0 },
    misconception_map: { '1': '분모 숫자가 더 큰 6이 더 크다고 오개념 가짐' }
  },
  {
    id: 'monster-2',
    concept_id: 'c-sub',
    concept_code: 'MATH-G3-SUB',
    concept_name: '세 자리 수의 뺄셈',
    difficulty: 3,
    qtype: 'short',
    body: { stem: '과수원에 사과가 805개 있었습니다. 그중 348개를 상자에 담았을 때 남은 사과는 몇 개인가요?' },
    answer: { value: '457' },
    misconception_map: {}
  }
]

export default function SrsReviewModal({ childName, onClose }: SrsReviewModalProps) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [shortVal, setShortVal] = useState('')
  const [isAnswered, setIsAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [defeatedCount, setDefeatedCount] = useState(0)
  const [isFinished, setIsFinished] = useState(false)

  const currentMonster = REVIEW_MONSTERS[index]

  const handleSubmit = () => {
    if (isAnswered) return
    let correct = false

    if (currentMonster.qtype === 'mcq') {
      if (selected === null) return
      correct = selected === currentMonster.answer.correct_index
    } else {
      if (!shortVal.trim()) return
      correct = shortVal.trim() === currentMonster.answer.value
    }

    setIsCorrect(correct)
    setIsAnswered(true)

    if (correct) {
      setDefeatedCount((prev) => prev + 1)
      calculateSRS({ intervalDays: 1, ease: 2.5 }, true)
    } else {
      calculateSRS({ intervalDays: 1, ease: 2.5 }, false)
    }
  }

  const handleNext = () => {
    setSelected(null)
    setShortVal('')
    setIsAnswered(false)

    if (index + 1 < REVIEW_MONSTERS.length) {
      setIndex((prev) => prev + 1)
    } else {
      setIsFinished(true)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl bg-[#FDFBF7] rounded-3xl border-2 border-rose-300 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* 파스텔 스트로베리 로즈 모달 헤더 */}
        <div className="bg-gradient-to-r from-rose-200 via-pink-100 to-rose-200 text-rose-950 px-6 py-4 flex justify-between items-center border-b border-rose-300 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-sm border border-rose-300">
              👾
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-rose-950">
                오답 괴물 격파 (맞춤 복습)
              </h2>
              <p className="text-xs text-rose-800 font-extrabold">
                {childName} 요리사의 복습 몬스터 출현 ✦
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

        {isFinished ? (
          <div className="p-8 text-center space-y-6">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-100 text-4xl border-2 border-rose-300 shadow-md">
              ⚔️
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">
                오답 괴물 퇴치 성공!
              </h3>
              <p className="text-sm text-slate-600 mt-1 font-bold">
                {childName} 요리사가 복습 몬스터 {defeatedCount}마리를 모두 물리쳤어요!
              </p>
            </div>

            <div className="bg-rose-50 rounded-2xl p-4 border border-rose-200 text-rose-900 font-extrabold text-sm">
              🎁 보상 +40 P 획득 완료! (복습 문항을 완벽하게 이해했어요)
            </div>

            <button
              onClick={() => onClose(40)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-black text-base shadow-lg transition-transform hover:scale-105"
            >
              🏆 +40 P 받고 대시보드로 돌아가기
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            {/* 몬스터 체력 및 프로그레스 */}
            <div className="bg-rose-50 rounded-2xl p-4 border border-rose-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-2xl animate-bounce">👾</span>
                <div>
                  <p className="text-xs font-bold text-rose-700">복습 몬스터 {index + 1}호</p>
                  <p className="text-sm font-black text-slate-900">{currentMonster.concept_name}</p>
                </div>
              </div>
              <span className="text-xs bg-rose-200 text-rose-900 font-extrabold px-3 py-1 rounded-full">
                자동 맞춤 복습 ⚔️
              </span>
            </div>

            {/* 문제 발문 */}
            <div className="bg-white rounded-3xl p-6 border-2 border-rose-200 shadow-sm space-y-2">
              <h3 className="text-lg font-black text-slate-900">
                Q. {currentMonster.body.stem}
              </h3>
            </div>

            {/* 객관식 보기 */}
            {currentMonster.qtype === 'mcq' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentMonster.body.choices?.map((choice, idx) => (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => setSelected(idx)}
                    className={`p-4 rounded-2xl border-2 text-left font-bold text-sm transition-all shadow-sm ${
                      isAnswered
                        ? idx === currentMonster.answer.correct_index
                          ? 'bg-emerald-100 border-emerald-400 text-emerald-950 font-black'
                          : selected === idx
                          ? 'bg-rose-100 border-rose-400 text-rose-950'
                          : 'bg-white'
                        : selected === idx
                        ? 'bg-rose-100 border-rose-400 ring-2 ring-rose-300'
                        : 'bg-white hover:bg-rose-50/50 border-slate-200'
                    }`}
                  >
                    {choice}
                  </button>
                ))}
              </div>
            )}

            {/* 단답형 입력 */}
            {currentMonster.qtype === 'short' && (
              <input
                type="text"
                disabled={isAnswered}
                placeholder="정답 입력"
                value={shortVal}
                onChange={(e) => setShortVal(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-white border-2 border-slate-200 font-black text-base"
              />
            )}

            {/* 피드백 */}
            {isAnswered && (
              <div
                className={`p-4 rounded-2xl border-2 font-black text-sm shadow-sm ${
                  isCorrect ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-rose-50 border-rose-300 text-rose-950'
                }`}
              >
                {isCorrect ? '⚔️ 쾅! 오답 괴물을 퇴치했어요!' : '👾 아쉽게도 괴물이 방어했어요. 오개념을 원리부터 다시 파악해봐요!'}
              </div>
            )}

            {/* 제출/다음 버튼 */}
            <div className="flex justify-end pt-2">
              {!isAnswered ? (
                <button
                  onClick={handleSubmit}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black text-sm shadow-md hover:scale-105 transition-all"
                >
                  괴물 공격하기 ⚔️
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-sm shadow-md hover:scale-105 transition-all"
                >
                  {index + 1 < REVIEW_MONSTERS.length ? '다음 괴물 격파하기 →' : '퇴치 완료! 보상 받기 🏆'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

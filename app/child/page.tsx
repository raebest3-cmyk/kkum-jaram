'use client'

import React, { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import MissionModal from '@/components/MissionModal'
import AiChatModal from '@/components/AiChatModal'
import SrsReviewModal from '@/components/SrsReviewModal'
import {
  getCurrentUser,
  fetchChildrenProfiles,
  fetchChildPoints,
  addPointsLedger,
  ChildProfile,
  UserAccount
} from '@/lib/auth'
import { getDailyMissionQuestions, QuestionItem } from '@/lib/questions'

export default function ChildDashboardPage() {
  const [user, setUser] = useState<UserAccount | null>(null)
  const [child, setChild] = useState<ChildProfile | null>(null)

  // 포인트 상태 (DB 연동)
  const [points, setPoints] = useState<number>(120)

  // 개념 숙달도 상태
  const [masteryMap, setMasteryMap] = useState<Record<string, number>>({
    'MATH-G3-ADD': 0.85,
    'MATH-G3-MUL': 0.60,
    'MATH-G3-FRAC': 0.40
  })

  // 미션 모달 상태
  const [showMissionModal, setShowMissionModal] = useState<boolean>(false)
  const [questions, setQuestions] = useState<QuestionItem[]>([])
  const [loadingMission, setLoadingMission] = useState<boolean>(false)

  // 미션 2 (복습) 및 미션 3 (AI 대화) 모달
  const [showSrsModal, setShowSrsModal] = useState<boolean>(false)
  const [showAiModal, setShowAiModal] = useState<boolean>(false)

  useEffect(() => {
    async function loadData() {
      const u = await getCurrentUser()
      setUser(u)

      if (u) {
        // Supabase DB 자녀 프로필 실시간 Fetch
        const list = await fetchChildrenProfiles(u.id)
        if (list.length > 0) {
          setChild(list[0])
          const dbPoints = await fetchChildPoints(list[0].id)
          setPoints(dbPoints)
        } else {
          setChild({
            id: 'subin-demo',
            account_id: u.id,
            nickname: '수빈이',
            grade: 3,
            dream_job: '요리사 👨‍🍳',
            theme: 'elementary'
          })
        }
      } else {
        setChild({
          id: 'subin-demo',
          account_id: 'demo',
          nickname: '수빈이',
          grade: 3,
          dream_job: '요리사 👨‍🍳',
          theme: 'elementary'
        })
      }

      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('kkum_jaram_mastery')
        if (stored) {
          try {
            setMasteryMap(JSON.parse(stored))
          } catch (e) {
            console.error(e)
          }
        }
      }
    }
    loadData()
  }, [])

  const handleStartMission = async () => {
    setLoadingMission(true)
    try {
      const qList = await getDailyMissionQuestions()
      setQuestions(qList)
      setShowMissionModal(true)
    } finally {
      setLoadingMission(false)
    }
  }

  const handleCloseMissionModal = async (earnedPoints: number) => {
    setShowMissionModal(false)
    if (earnedPoints > 0 && child) {
      const updated = await addPointsLedger(child.id, earnedPoints, '오늘의 10문항 완주')
      setPoints(updated)
      refreshMastery()
    }
  }

  const handleCloseSrsModal = async (earnedPoints: number) => {
    setShowSrsModal(false)
    if (earnedPoints > 0 && child) {
      const updated = await addPointsLedger(child.id, earnedPoints, '오답 괴물 격파 복습')
      setPoints(updated)
      refreshMastery()
    }
  }

  const handleCloseAiModal = async (earnedPoints: number) => {
    setShowAiModal(false)
    if (earnedPoints > 0 && child) {
      const updated = await addPointsLedger(child.id, earnedPoints, 'AI 말로 설명하기 대화')
      setPoints(updated)
    }
  }

  const refreshMastery = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('kkum_jaram_mastery')
      if (stored) {
        try {
          setMasteryMap(JSON.parse(stored))
        } catch (e) {
          console.error(e)
        }
      }
    }
  }

  const childName = child?.nickname || '수빈이'
  const dreamJob = child?.dream_job || '요리사 👨‍🍳'

  const addMastery = Math.round((masteryMap['MATH-G3-ADD'] ?? 0.85) * 100)
  const mulMastery = Math.round((masteryMap['MATH-G3-MUL'] ?? 0.60) * 100)
  const fracMastery = Math.round((masteryMap['MATH-G3-FRAC'] ?? 0.40) * 100)

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-800 font-sans flex flex-col">
      <Navbar />

      <div className="flex-1 p-4 sm:p-8 max-w-6xl mx-auto w-full space-y-8">
        {/* 상단 프로필 카드 */}
        <section className="relative overflow-hidden bg-white rounded-3xl p-6 sm:p-8 border border-amber-200/60 shadow-xl shadow-amber-900/5">
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-amber-100/60 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-emerald-100/60 rounded-full blur-2xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-amber-300 via-yellow-200 to-emerald-200 flex items-center justify-center text-4xl shadow-md border-2 border-white ring-4 ring-amber-100">
                  👧
                </div>
                <div className="absolute -bottom-1 -right-1 bg-white text-xs p-1 rounded-full shadow border border-amber-200">
                  👨‍🍳
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {childName}의 꿈 자람 터
                  </h1>
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-300/80 px-3 py-1 rounded-full text-xs font-black">
                    초등학교 {child?.grade || 3}학년 🌱
                  </span>
                  <span className="bg-amber-100 text-amber-900 border border-amber-300/80 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1">
                    <span>꿈:</span>
                    <span>{dreamJob}</span>
                  </span>
                </div>

                <div className="mt-3 inline-flex items-center gap-2 bg-[#FFF8E7] text-[#B45309] border border-[#FDE68A] px-4 py-2 rounded-2xl text-xs font-bold shadow-sm">
                  <span className="text-base">🍳</span>
                  <span>
                    <strong>{childName} 요리사의 오늘 특별 미션 레시피!</strong> 10개 문항을 풀고 실시간 보상을 받아보세요!
                  </span>
                </div>
              </div>
            </div>

            {/* 보유 포인트 파스텔 젤리 뱃지 */}
            <div className="w-full md:w-auto bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 px-6 py-4 rounded-3xl shadow-sm flex items-center justify-between md:justify-end gap-4">
              <div className="text-left md:text-right">
                <p className="text-xs font-extrabold text-amber-700/80">나의 보물 포인트 (DB 연동)</p>
                <p className="text-2xl font-black text-amber-600 flex items-center gap-1.5 mt-0.5">
                  <span>🪙</span>
                  <span>{points} P</span>
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-amber-200/60 flex items-center justify-center text-xl text-amber-700">
                🎁
              </div>
            </div>
          </div>
        </section>

        {/* 오늘의 미션 카드 3종 */}
        <section>
          <div className="flex justify-between items-end mb-4 px-1">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <span>🎯</span>
                <span>오늘의 미션 레시피 (3종)</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                버튼을 누르면 실시간 문제 풀이가 시작됩니다!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 미션 1 */}
            <div className="group relative bg-[#E6F7F2] rounded-3xl p-6 border-2 border-[#BEEBDD] shadow-lg shadow-emerald-900/5 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="w-10 h-10 rounded-2xl bg-white text-[#0D8A68] flex items-center justify-center font-black text-base shadow-sm border border-[#A7F3D0]">
                    01
                  </span>
                  <span className="bg-white/80 text-[#0D8A68] text-[11px] font-black px-3 py-1 rounded-full border border-[#A7F3D0]">
                    일반 미션 🌿
                  </span>
                </div>
                <h3 className="text-xl font-black text-[#065F46] mb-1">
                  오늘의 수학 10문항
                </h3>
                <p className="text-xs text-[#0D8A68]/80 leading-relaxed font-bold mb-6">
                  복습 문제 4개 + 새로운 도전 문제 6개 (실시간 채점과 힌트 제공)
                </p>
              </div>

              <div className="pt-4 border-t border-[#BEEBDD]/60 flex items-center justify-between">
                <span className="text-xs font-bold text-[#065F46]">보상 +50 P</span>
                <button
                  disabled={loadingMission}
                  onClick={handleStartMission}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#0D8A68] to-emerald-500 hover:from-[#0b7457] hover:to-emerald-600 text-white font-black text-xs shadow-md hover:scale-105 transition-all flex items-center gap-1 disabled:opacity-50"
                >
                  <span>{loadingMission ? '로딩 중...' : '도전하기'}</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            {/* 미션 2 */}
            <div className="group relative bg-[#FFEBEB] rounded-3xl p-6 border-2 border-[#FFC7C7] shadow-lg shadow-rose-900/5 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="w-10 h-10 rounded-2xl bg-white text-rose-600 flex items-center justify-center font-black text-base shadow-sm border border-rose-200">
                    02
                  </span>
                  <span className="bg-white/80 text-rose-700 text-[11px] font-black px-3 py-1 rounded-full border border-rose-200">
                    복습 미션 👾
                  </span>
                </div>
                <h3 className="text-xl font-black text-rose-900 mb-1">
                  오답 괴물 격파하기
                </h3>
                <p className="text-xs text-rose-700/80 leading-relaxed font-bold mb-6">
                  틀렸던 문제를 잊기 전에 차근차근 다시 풀어보기
                </p>
              </div>

              <div className="pt-4 border-t border-[#FFC7C7]/60 flex items-center justify-between">
                <span className="text-xs font-bold text-rose-800">괴물 2마리 대기</span>
                <button
                  onClick={() => setShowSrsModal(true)}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-black text-xs shadow-md hover:scale-105 transition-all flex items-center gap-1"
                >
                  <span>격파 시작</span>
                  <span>⚔️</span>
                </button>
              </div>
            </div>

            {/* 미션 3 (STT 연동) */}
            <div className="group relative bg-[#FFF8E7] rounded-3xl p-6 border-2 border-[#FFE8B3] shadow-lg shadow-amber-900/5 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="w-10 h-10 rounded-2xl bg-white text-amber-600 flex items-center justify-center font-black text-base shadow-sm border border-amber-200">
                    03
                  </span>
                  <span className="bg-white/80 text-amber-800 text-[11px] font-black px-3 py-1 rounded-full border border-amber-200">
                    음성 대화 🎙️
                  </span>
                </div>
                <h3 className="text-xl font-black text-amber-950 mb-1">
                  AI와 말로 설명하기
                </h3>
                <p className="text-xs text-amber-800/80 leading-relaxed font-bold mb-6">
                  음성 마이크🎙️로 직접 나눗셈 개념을 AI 선생님에게 요리법처럼 설명해 봐요!
                </p>
              </div>

              <div className="pt-4 border-t border-[#FFE8B3]/60 flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900">보상 +30 P</span>
                <button
                  onClick={() => setShowAiModal(true)}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-amber-950 font-black text-xs shadow-md hover:scale-105 transition-all flex items-center gap-1"
                >
                  <span>음성 대화하기</span>
                  <span>💬</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 성취 곡선 & 소원 퍼즐 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-amber-200/60 shadow-lg shadow-amber-900/5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span>📈</span>
                  <span>개념 숙달도 성취 곡선</span>
                </h3>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  성장 곡선 반영
                </span>
              </div>

              <div className="space-y-4 pt-1">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">세 자리 수 덧셈·뺄셈</span>
                    <span className="text-emerald-600">{addMastery}% (숙달)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                    <div
                      className="bg-gradient-to-r from-emerald-400 to-[#0D8A68] h-full rounded-full transition-all duration-500"
                      style={{ width: `${addMastery}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">곱셈과 나눗셈 기초</span>
                    <span className="text-amber-600">{mulMastery}% (성장 중)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                    <div
                      className="bg-gradient-to-r from-amber-400 to-orange-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${mulMastery}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">분수와 소수 한 자리</span>
                    <span className="text-blue-600">{fracMastery}% (도전 중)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                    <div
                      className="bg-gradient-to-r from-blue-400 to-indigo-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${fracMastery}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mt-4 pt-3 border-t border-slate-100 text-center font-bold">
              💡 문제를 풀 때마다 AI가 아이의 성장도를 실시간으로 계산해요!
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-amber-200/60 shadow-lg shadow-amber-900/5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span>🎁</span>
                  <span>나의 첫 소원상자 퍼즐</span>
                </h3>
                <span className="text-xs bg-amber-100 text-amber-900 px-3 py-1 rounded-full font-black">
                  진행 중 🧩
                </span>
              </div>

              <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/80 rounded-2xl p-5 border border-amber-200/80 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-extrabold text-amber-700">도전 소원 선물</span>
                    <p className="text-xl font-black text-slate-900 mt-0.5">
                      어린이 쉐프 요리 도구 세트 👨‍🍳
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-sm border border-amber-200">
                    🍳
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-black">
                    <span className="text-slate-600">포인트 모으기 (DB 실시간 연동)</span>
                    <span className="text-amber-600">
                      {points} P / 500 P ({Math.min(100, Math.round((points / 500) * 100))}%)
                    </span>
                  </div>
                  <div className="w-full bg-white h-4 rounded-full overflow-hidden p-0.5 border border-amber-200">
                    <div
                      className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 h-full rounded-full transition-all duration-500 shadow-inner"
                      style={{ width: `${Math.min(100, Math.round((points / 500) * 100))}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
              <span>남은 포인트: {Math.max(0, 500 - points)} P</span>
              <span className="text-amber-600 font-extrabold">미션 완주 시 +50 P 지급!</span>
            </div>
          </div>
        </div>
      </div>

      {showMissionModal && (
        <MissionModal
          questions={questions}
          childName={childName}
          onClose={handleCloseMissionModal}
        />
      )}

      {showSrsModal && (
        <SrsReviewModal
          childName={childName}
          onClose={handleCloseSrsModal}
        />
      )}

      {showAiModal && (
        <AiChatModal
          childName={childName}
          dreamJob={dreamJob}
          onClose={handleCloseAiModal}
        />
      )}
    </div>
  )
}

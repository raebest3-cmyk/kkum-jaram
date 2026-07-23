'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import MissionModal from '@/components/MissionModal'
import AiChatModal from '@/components/AiChatModal'
import SrsReviewModal from '@/components/SrsReviewModal'
import {
  getCurrentUser,
  fetchChildrenProfiles,
  fetchChildPoints,
  addPointsLedger,
  fetchAchievedWishes,
  getSelectedChildId,
  setSelectedChildId,
  ChildProfile,
  UserAccount,
  WishItem
} from '@/lib/auth'
import { getDailyMissionQuestions, QuestionItem } from '@/lib/questions'

export default function ChildDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserAccount | null>(null)
  const [childrenList, setChildrenList] = useState<ChildProfile[]>([])
  const [child, setChild] = useState<ChildProfile | null>(null)

  // 프로필 스위처 모달 상태
  const [showProfileSwitcher, setShowProfileSwitcher] = useState<boolean>(false)

  // 포인트 (선물 조각) 상태 (DB 연동)
  const [points, setPoints] = useState<number>(120)

  // 추억 앨범 갤러리 모달 상태
  const [showAlbumModal, setShowAlbumModal] = useState<boolean>(false)
  const [achievedWishes, setAchievedWishes] = useState<WishItem[]>([])

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

  const loadTargetChildData = async (targetChild: ChildProfile) => {
    setChild(targetChild)
    setSelectedChildId(targetChild.id)

    const dbPoints = await fetchChildPoints(targetChild.id)
    setPoints(dbPoints)

    const achieved = await fetchAchievedWishes(targetChild.id)
    setAchievedWishes(achieved)
  }

  useEffect(() => {
    async function loadData() {
      const u = await getCurrentUser()
      if (!u) {
        router.push('/login')
        return
      }
      setUser(u)

      const list = await fetchChildrenProfiles(u.id)
      setChildrenList(list)

      if (list.length > 0) {
        const savedId = getSelectedChildId()
        const found = list.find((c) => c.id === savedId)
        const selected = found || list[0]
        await loadTargetChildData(selected)
      } else {
        // 등록된 아이 프로필이 없으면 온보딩 페이지로 이동
        router.push('/onboarding')
        return
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
  }, [router])

  // 프로필 전환 선택 시
  const handleSwitchChild = async (ch: ChildProfile) => {
    await loadTargetChildData(ch)
    setShowProfileSwitcher(false)
  }

  // 학년별 맞춤 출제 함수 연동
  const handleStartMission = async () => {
    setLoadingMission(true)
    try {
      const currentGrade = child?.grade || 3
      const qList = await getDailyMissionQuestions(currentGrade)
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
  const dreamJob = child?.dream_job || '꿈나무 🌟'
  const grade = child?.grade || 3

  const addMastery = Math.round((masteryMap['MATH-G3-ADD'] ?? 0.85) * 100)
  const mulMastery = Math.round((masteryMap['MATH-G3-MUL'] ?? 0.60) * 100)
  const fracMastery = Math.round((masteryMap['MATH-G3-FRAC'] ?? 0.40) * 100)

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-800 font-sans flex flex-col">
      <Navbar />

      <div className="flex-1 p-4 sm:p-8 max-w-6xl mx-auto w-full space-y-8">
        {/* 동적 프로필 웰컴 카드 */}
        <section className="relative overflow-hidden bg-white rounded-3xl p-6 sm:p-8 border border-amber-200/60 shadow-xl shadow-amber-900/5">
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-amber-100/60 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-emerald-100/60 rounded-full blur-2xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-amber-300 via-yellow-200 to-emerald-200 flex items-center justify-center text-4xl shadow-md border-2 border-white ring-4 ring-amber-100">
                  {grade <= 3 ? '👧' : '👦'}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {childName}의 꿈 자람 터
                  </h1>
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-300/80 px-3 py-1 rounded-full text-xs font-black">
                    초등학교 {grade}학년 🌱
                  </span>
                  <span className="bg-amber-100 text-amber-900 border border-amber-300/80 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1">
                    <span>희망:</span>
                    <span>{dreamJob}</span>
                  </span>

                  {/* 프로필 스위처 버튼 */}
                  {childrenList.length > 1 && (
                    <button
                      onClick={() => setShowProfileSwitcher(true)}
                      className="px-3 py-1 rounded-full bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-950 font-black text-xs border border-slate-300 transition-colors shadow-sm flex items-center gap-1"
                    >
                      <span>🔄</span>
                      <span>자녀 바꾸기</span>
                    </button>
                  )}
                </div>

                <div className="mt-3 inline-flex items-center gap-2 bg-[#FFF8E7] text-[#B45309] border border-[#FDE68A] px-4 py-2 rounded-2xl text-xs font-bold shadow-sm">
                  <span className="text-base">🚀</span>
                  <span>
                    <strong>{childName} 어린이({grade}학년)의 오늘 맞춤 미션!</strong> {dreamJob}의 꿈을 위해 문항을 풀고 보상을 받아보세요!
                  </span>
                </div>
              </div>
            </div>

            {/* 보유 선물 조각 파스텔 젤리 뱃지 */}
            <div className="w-full md:w-auto bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 px-6 py-4 rounded-3xl shadow-sm flex items-center justify-between md:justify-end gap-4">
              <div className="text-left md:text-right">
                <p className="text-xs font-extrabold text-amber-700/80">{childName}의 보유 선물 조각</p>
                <p className="text-2xl font-black text-amber-600 flex items-center gap-1.5 mt-0.5">
                  <span>🧩</span>
                  <span>{points}개 모음</span>
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
                <span>{childName}의 맞춤 미션 ({grade}학년 레벨)</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                버튼을 누르면 {grade}학년 맞춤 수학 문제 풀이가 시작됩니다!
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
                    {grade}학년 수학 🌿
                  </span>
                </div>
                <h3 className="text-xl font-black text-[#065F46] mb-1">
                  오늘의 수학 10문항
                </h3>
                <p className="text-xs text-[#0D8A68]/80 leading-relaxed font-bold mb-6">
                  {grade}학년 단원 맞춤 문제 (실시간 채점과 Gemini AI 힌트 제공)
                </p>
              </div>

              <div className="pt-4 border-t border-[#BEEBDD]/60 flex items-center justify-between">
                <span className="text-xs font-bold text-[#065F46]">보상 +50 조각</span>
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

            {/* 미션 3 */}
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
                  음성 마이크🎙️로 직접 수학 개념을 Gemini AI 선생님에게 설명해 봐요!
                </p>
              </div>

              <div className="pt-4 border-t border-[#FFE8B3]/60 flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900">보상 +30 조각</span>
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
                  <span>{grade}학년 개념 숙달도 성취 곡선</span>
                </h3>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  성장 곡선 반영
                </span>
              </div>

              <div className="space-y-4 pt-1">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">단원 1 핵심 개념</span>
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
                    <span className="text-slate-700">단원 2 응용 개념</span>
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
                    <span className="text-slate-700">단원 3 심화 개념</span>
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
                  <span>{childName}의 소원상자 퍼즐</span>
                </h3>
                <button
                  onClick={() => setShowAlbumModal(true)}
                  className="text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-900 px-3 py-1 rounded-full font-black border border-emerald-300 transition-colors flex items-center gap-1 shadow-sm"
                >
                  <span>📸 추억 앨범 ({achievedWishes.length})</span>
                </button>
              </div>

              <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/80 rounded-2xl p-5 border border-amber-200/80 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-extrabold text-amber-700">도전 소원 선물</span>
                    <p className="text-xl font-black text-slate-900 mt-0.5">
                      원하는 소원 선물 상자 🎁
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-sm border border-amber-200">
                    🎁
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-black">
                    <span className="text-slate-600">선물 조각 모으기 (DB 연동)</span>
                    <span className="text-amber-600">
                      🧩 {points} / 500개 ({Math.min(100, Math.round((points / 500) * 100))}%)
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
              <span>남은 선물 조각: {Math.max(0, 500 - points)}개</span>
              <span className="text-amber-600 font-extrabold">미션 완주 시 +50 조각 지급!</span>
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

      {/* 🔄 자녀 프로필 스위처 모달 */}
      {showProfileSwitcher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm bg-[#FDFBF7] rounded-3xl border-2 border-amber-300 p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-amber-200 pb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>🔄</span>
                <span>자녀 프로필 선택</span>
              </h3>
              <button
                onClick={() => setShowProfileSwitcher(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {childrenList.map((item) => {
                const isSelected = item.id === child?.id
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSwitchChild(item)}
                    className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-amber-100/80 border-amber-400 font-black text-amber-950 ring-2 ring-amber-300'
                        : 'bg-white border-slate-200 hover:bg-amber-50 font-bold text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.grade <= 3 ? '👧' : '👦'}</span>
                      <div>
                        <div className="text-sm font-black">{item.nickname}</div>
                        <div className="text-xs text-slate-500">초등 {item.grade}학년 | {item.dream_job || '꿈나무'}</div>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="text-xs font-black text-amber-800 bg-amber-200 px-2.5 py-1 rounded-full">
                        선택됨 ✓
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* 📸 추억 앨범 갤러리 모달 */}
      {showAlbumModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl bg-[#FDFBF7] rounded-3xl border-2 border-emerald-300 p-6 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-emerald-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📸</span>
                <h3 className="text-lg font-black text-emerald-950">{childName}의 추억 앨범 갤러리</h3>
              </div>
              <button
                onClick={() => setShowAlbumModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-xs"
              >
                ✕
              </button>
            </div>

            {achievedWishes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {achievedWishes.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-md space-y-3 flex flex-col justify-between"
                  >
                    {item.proof_image_path ? (
                      <div className="w-full h-44 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                        <img
                          src={item.proof_image_path}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-36 rounded-xl bg-gradient-to-tr from-amber-100 via-yellow-50 to-emerald-100 flex items-center justify-center text-4xl border border-emerald-200">
                        🎁
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          {item.redemption_type || '선물 조각 교환'}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400">
                          {item.achieved_at ? new Date(item.achieved_at).toLocaleDateString() : '달성 완료'}
                        </span>
                      </div>

                      <h4 className="text-base font-black text-slate-900">{item.title}</h4>

                      {item.parent_message && (
                        <p className="text-xs text-slate-600 bg-amber-50 p-2.5 rounded-xl border border-amber-200/60 font-medium italic mt-2">
                          "{item.parent_message}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 space-y-3 text-slate-500">
                <div className="w-16 h-16 rounded-3xl bg-emerald-100 flex items-center justify-center text-3xl mx-auto border border-emerald-200">
                  📸
                </div>
                <p className="text-sm font-bold">아직 보관된 소원 달성 추억 앨범이 없습니다.</p>
                <p className="text-xs text-slate-400">
                  매일 문제를 풀어 500개의 선물 조각을 모으면 부모님께서 예쁜 선물과 축하 메시지를 앨범에 보관해 주실 거예요!
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import {
  getCurrentUser,
  fetchChildrenProfiles,
  createChildProfile,
  updateChildProfile,
  deleteChildProfile,
  fetchChildPoints,
  addPointsLedger,
  fetchWishes,
  updateWishStatus,
  ChildProfile,
  UserAccount,
  WishItem,
  getUserApiKey
} from '@/lib/auth'

export default function ParentDashboardPage() {
  const [user, setUser] = useState<UserAccount | null>(null)
  const [children, setChildren] = useState<ChildProfile[]>([])
  const [hasApiKey, setHasApiKey] = useState<boolean>(false)

  // 소원 승인 팝업 모달 상태
  const [showApprovalModal, setShowApprovalModal] = useState<boolean>(false)
  const [wishes, setWishes] = useState<WishItem[]>([])
  const [wishStatus, setWishStatus] = useState<'active' | 'achieved'>('active')
  const [childPoints, setChildPoints] = useState<number>(520)

  // 자녀 프로필 추가 모달 상태
  const [showAddChildModal, setShowAddChildModal] = useState<boolean>(false)
  const [newNickname, setNewNickname] = useState('')
  const [newGrade, setNewGrade] = useState<number>(3)
  const [newDreamJob, setNewDreamJob] = useState('')
  const [newWishTitle, setNewWishTitle] = useState('')
  const [newWishPoints, setNewWishPoints] = useState<number>(100)
  const [isSubmittingChild, setIsSubmittingChild] = useState<boolean>(false)

  // 자녀 프로필 수정 모달 상태
  const [editingChild, setEditingChild] = useState<ChildProfile | null>(null)
  const [editNickname, setEditNickname] = useState('')
  const [editGrade, setEditGrade] = useState<number>(3)
  const [editDreamJob, setEditDreamJob] = useState('')
  const [editWishTitle, setEditWishTitle] = useState('')
  const [editWishPoints, setEditWishPoints] = useState<number>(100)
  const [isSubmittingEdit, setIsSubmittingEdit] = useState<boolean>(false)

  const reloadChildren = async (accountId: string) => {
    const list = await fetchChildrenProfiles(accountId)
    setChildren(list)
    if (list.length > 0) {
      const childId = list[0].id
      const pts = await fetchChildPoints(childId)
      setChildPoints(pts)

      const wishList = await fetchWishes(childId)
      setWishes(wishList)
      if (wishList.length > 0 && wishList[0].status) {
        setWishStatus(wishList[0].status as 'active' | 'achieved')
      }
    }
  }

  useEffect(() => {
    async function loadData() {
      const u = await getCurrentUser()
      setUser(u)

      if (u) {
        await reloadChildren(u.id)
      }

      const key = getUserApiKey()
      setHasApiKey(!!key)
    }
    loadData()
  }, [])

  const handleApproveWish = async () => {
    if (childPoints < 500) {
      alert('아이의 보유 포인트가 목표 포인트(500P)보다 부족합니다.')
      return
    }

    if (children.length > 0) {
      const childId = children[0].id
      await addPointsLedger(childId, -500, '소원상자 선물 승인 차감')
      if (wishes.length > 0 && wishes[0].id) {
        await updateWishStatus(wishes[0].id, 'achieved')
      }
      setChildPoints((prev) => prev - 500)
    }

    setWishStatus('achieved')
    setShowApprovalModal(false)

    alert('🎉 소원이 성공적으로 승인되었습니다! 선물 인증샷이 가족 꿈 앨범에 보관됩니다.')
  }

  // 자녀 추가 핸들러
  const handleAddChildSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNickname.trim()) {
      alert('아이의 별명을 입력해 주세요!')
      return
    }

    setIsSubmittingChild(true)
    try {
      const userId = user?.id || 'demo-parent-uuid-001'
      await createChildProfile(
        userId,
        newNickname.trim(),
        newGrade,
        newDreamJob.trim() || '꿈나무 🌟',
        newWishTitle.trim() || '소원 선물 상자 🎁',
        newWishPoints || 100
      )

      await reloadChildren(userId)

      setNewNickname('')
      setNewGrade(3)
      setNewDreamJob('')
      setNewWishTitle('')
      setNewWishPoints(100)
      setShowAddChildModal(false)

      alert('🎉 자녀 프로필이 성공적으로 저장되었습니다!')
    } catch (err) {
      console.error(err)
      alert('자녀 프로필 저장 중 오류가 발생했습니다.')
    } finally {
      setIsSubmittingChild(false)
    }
  }

  // 자녀 수정 클릭
  const handleOpenEditModal = async (ch: ChildProfile) => {
    setEditingChild(ch)
    setEditNickname(ch.nickname)
    setEditGrade(ch.grade)
    setEditDreamJob(ch.dream_job || ch.actual_job || '')
    
    // 소원 정보 로드
    const wishList = await fetchWishes(ch.id)
    if (wishList.length > 0) {
      setEditWishTitle(wishList[0].title || '')
      setEditWishPoints(wishList[0].target_points || 100)
    } else {
      setEditWishTitle('')
      setEditWishPoints(100)
    }
  }

  // 자녀 수정 제출 핸들러
  const handleEditChildSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingChild || !editNickname.trim()) return

    setIsSubmittingEdit(true)
    try {
      await updateChildProfile(
        editingChild.id,
        editNickname.trim(),
        editGrade,
        editDreamJob.trim() || '꿈나무 🌟',
        editWishTitle.trim() || '소원 선물 상자 🎁',
        editWishPoints || 100
      )

      const userId = user?.id || 'demo-parent-uuid-001'
      await reloadChildren(userId)

      setEditingChild(null)
      alert('🎉 자녀 프로필이 성공적으로 수정되었습니다!')
    } catch (err) {
      console.error(err)
      alert('자녀 프로필 수정 중 오류가 발생했습니다.')
    } finally {
      setIsSubmittingEdit(false)
    }
  }

  // 자녀 삭제 클릭
  const handleDeleteChild = async (ch: ChildProfile) => {
    if (!window.confirm(`정말로 '${ch.nickname}' 자녀 프로필을 삭제하시겠습니까?\n(등록된 학습 풀이 기록 및 소원 정보가 함께 삭제됩니다)`)) {
      return
    }

    try {
      await deleteChildProfile(ch.id)
      const userId = user?.id || 'demo-parent-uuid-001'
      await reloadChildren(userId)
      alert(`🗑️ '${ch.nickname}' 자녀 프로필이 삭제되었습니다.`)
    } catch (err) {
      console.error(err)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  const firstChild = children.length > 0 ? children[0] : null
  const childName = firstChild?.nickname || '수빈이'
  const dreamJob = firstChild?.dream_job || '꿈나무 🌟'

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-800 font-sans flex flex-col">
      <Navbar />

      <div className="flex-1 p-4 sm:p-8 max-w-6xl mx-auto w-full space-y-8">
        {/* 상단 부모 헤더 */}
        <header className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200/60 shadow-xl shadow-amber-900/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">👨‍👩‍👧</span>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                부모 학습 성장 리포트
              </h1>
              <span className="text-xs font-black px-3 py-1 rounded-full bg-[#003087] text-[#C8A951]">
                Supabase DB 연동 세션
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              로그인한 사용자 계정(`account_id`) 기준의 실시간 자녀 데이터 리포트입니다.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddChildModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 text-[#00205b] font-black text-xs hover:scale-105 transition-transform shadow-md flex items-center gap-1.5"
            >
              <span>+</span>
              <span>아이 프로필 추가</span>
            </button>
          </div>
        </header>

        <main className="space-y-8">
          {/* 1. 주간 학습 성취도 요약 */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white rounded-3xl p-5 border border-amber-200/60 shadow-md flex flex-col justify-between">
              <span className="text-xs font-extrabold text-slate-500">주간 풀이 문항 수</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900">42</span>
                <span className="text-xs font-bold text-slate-500">문제</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 mt-2">↑ 지난주 대비 +12문제</span>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-amber-200/60 shadow-md flex flex-col justify-between">
              <span className="text-xs font-extrabold text-slate-500">주간 평균 정답률</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-black text-emerald-600">85%</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 mt-2">⭐ 높은 이해도 유지 중</span>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-amber-200/60 shadow-md flex flex-col justify-between">
              <span className="text-xs font-extrabold text-slate-500">DB 실시간 보유 포인트</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-black text-amber-600">🪙 {childPoints}</span>
                <span className="text-xs font-bold text-slate-500">P</span>
              </div>
              <span className="text-[11px] font-bold text-amber-700 mt-2">소원 목표(500P) 달성</span>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-amber-200/60 shadow-md flex flex-col justify-between">
              <span className="text-xs font-extrabold text-slate-500">주간 학습 시간</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-black text-indigo-600">3.5</span>
                <span className="text-xs font-bold text-slate-500">시간</span>
              </div>
              <span className="text-[11px] font-bold text-indigo-600 mt-2">매일 꾸준한 자기주도학습</span>
            </div>
          </section>

          {/* 2. 등록된 자녀 프로필 세션 (수정 / 삭제 기능 탑재) */}
          <section className="bg-white rounded-3xl p-6 sm:p-7 border border-amber-200/60 shadow-xl shadow-amber-900/5 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>👦👧</span>
                <span>DB 연동된 자녀 프로필 ({children.length}명)</span>
              </h2>
              <button
                onClick={() => setShowAddChildModal(true)}
                className="text-xs font-extrabold text-amber-700 hover:text-amber-900 flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200"
              >
                <span>+ 자녀 등록하기</span>
              </button>
            </div>

            {children.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {children.map((ch) => (
                  <div
                    key={ch.id}
                    className="bg-[#FAF8F5] rounded-2xl p-5 border border-amber-200/80 flex flex-col justify-between gap-3 shadow-sm hover:border-amber-300 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-black text-slate-900">{ch.nickname}</span>
                          <span className="text-xs bg-[#003087] text-[#C8A951] px-2.5 py-0.5 rounded-full font-black">
                            초등 {ch.grade}학년
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-bold mt-1">
                          희망: {ch.dream_job || '꿈나무 🌟'} | 보유 포인트: 🪙 {childPoints} P
                        </p>
                      </div>

                      {/* 수정 ✏️ / 삭제 🗑️ 액션 버튼 */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(ch)}
                          title="프로필 수정"
                          className="px-2.5 py-1 rounded-xl bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                        >
                          <span>✏️</span>
                          <span>수정</span>
                        </button>

                        <button
                          onClick={() => handleDeleteChild(ch)}
                          title="프로필 삭제"
                          className="px-2.5 py-1 rounded-xl bg-white hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                        >
                          <span>🗑️</span>
                          <span>삭제</span>
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-amber-200/50 flex justify-end">
                      <Link
                        href="/child"
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 text-xs font-black transition-transform hover:scale-105 shadow-sm"
                      >
                        학습 대시보드 뷰 →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-sm font-bold space-y-3">
                <p>등록된 자녀 프로필이 없습니다.</p>
                <button
                  onClick={() => setShowAddChildModal(true)}
                  className="px-5 py-2 rounded-2xl bg-amber-400 text-amber-950 font-black text-xs shadow-sm hover:scale-105 transition-transform"
                >
                  + 지금 첫 자녀 프로필 추가하기
                </button>
              </div>
            )}
          </section>

          {/* 3. 단원별 약점 분석 & AI 성장 총평 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-amber-200/60 shadow-xl shadow-amber-900/5 space-y-5">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>📊</span>
                  <span>단원별 약점 개념 분석</span>
                </h2>
                <span className="text-xs font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
                  초등 3학년 수학
                </span>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-800">1. 세 자리 수의 덧셈·뺄셈</span>
                    <span className="text-emerald-600">85% (우수 ⭐)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200">
                    <div className="bg-gradient-to-r from-emerald-400 to-[#0D8A68] h-full rounded-full w-[85%]" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-800">2. 곱셈과 나눗셈 기초</span>
                    <span className="text-amber-600">60% (보통)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200">
                    <div className="bg-gradient-to-r from-amber-400 to-orange-400 h-full rounded-full w-[60%]" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-800">3. 분수의 크기 비교</span>
                    <span className="text-rose-600">40% (약점 집중 복습 필요 ⚠️)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200">
                    <div className="bg-gradient-to-r from-rose-400 to-pink-500 h-full rounded-full w-[40%]" />
                  </div>
                </div>
              </div>

              <div className="bg-rose-50/80 rounded-2xl p-4 border border-rose-200 text-xs text-rose-900 font-bold leading-relaxed">
                💡 <strong>약점 분석 처방:</strong> {childName} 어린이는 단위분수 크기 비교(1/4 과 1/6)에서 분모가 클수록 작아지는 원리를 더 다질 필요가 있습니다.
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-amber-200/60 shadow-xl shadow-amber-900/5 space-y-5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <span>📝</span>
                    <span>AI 주간 성장 총평 리포트</span>
                  </h2>
                  <span className="text-xs font-bold bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full">
                    이번 주 리포트
                  </span>
                </div>

                <div className="mt-4 bg-[#FFF8E7] rounded-2xl p-5 border border-[#FDE68A] space-y-3 text-xs sm:text-sm text-slate-800 font-bold leading-relaxed">
                  <p className="text-amber-950">
                    "{childName} 어린이는 이번 주 <strong>세 자리 수 덧셈·뺄셈</strong> 단원을 높은 정답률로 완벽히 마스터하였습니다!"
                  </p>
                  <p className="text-slate-700 font-medium">
                    특히 <strong>AI 말로 설명하기 미션</strong>에서 {dreamJob}의 꿈에 어울리는 논리적인 언어로 나눗셈 원리를 설명하는 메타인지 능력이 매우 뛰어납니다.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs font-extrabold text-amber-800 flex items-center justify-between">
                <span>AI 지능형 리포트 발급 완료</span>
                <span>매주 일요일 자동 갱신</span>
              </div>
            </div>
          </div>

          {/* 4. 소원상자 승인 & BYOK 관리 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-amber-200/60 shadow-lg shadow-amber-900/5 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span>🎁</span>
                  <span>소원상자 승인 & 포인트 정산 (DB)</span>
                </h3>
                <span
                  className={`text-xs px-3 py-1 rounded-full font-black ${
                    wishStatus === 'achieved'
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}
                >
                  {wishStatus === 'achieved' ? '선물 승인완료 🎉' : '목표 달성 (승인대기)'}
                </span>
              </div>

              <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-amber-200/80 space-y-2 text-xs font-bold">
                <div className="flex justify-between text-slate-700">
                  <span>신청된 소원 선물:</span>
                  <span className="font-black text-amber-700">
                    {wishes.length > 0 ? wishes[0].title : '원하는 소원 선물 상자 🎁'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>목표 / 보유 포인트:</span>
                  <span className="font-black text-slate-900">500 P / {childPoints} P</span>
                </div>
              </div>

              <div className="pt-1">
                {wishStatus === 'active' ? (
                  <button
                    onClick={() => setShowApprovalModal(true)}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-amber-950 font-black text-xs shadow-md hover:scale-[1.02] transition-all"
                  >
                    🎁 소원 선물 승인 및 포인트 정산하기
                  </button>
                ) : (
                  <div className="text-center py-2.5 text-xs font-black text-emerald-800 bg-emerald-50 rounded-2xl border border-emerald-200">
                    🎉 선물 승인이 완료되어 가족 꿈 앨범에 보관되었습니다.
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-amber-200/60 shadow-lg shadow-amber-900/5 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span>🔑</span>
                  <span>AI API 키 (BYOK) 현황</span>
                </h3>
                <span
                  className={`text-xs px-3 py-1 rounded-full font-black ${
                    hasApiKey
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}
                >
                  {hasApiKey ? '연동 완료' : '키 미설정'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Google Gemini API 키를 설정하면 Edge Function을 통해 AI 오답 분석 및 맞춤 피드백 기능이 활성화됩니다.
              </p>
              <div className="pt-1">
                <Link href="/onboarding" className="text-xs text-amber-700 hover:underline font-black">
                  API 키 등록/변경하기 →
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* 자녀 프로필 추가 모달 */}
      {showAddChildModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-[#FDFBF7] rounded-3xl border-2 border-amber-300 p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-amber-200 pb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>👦👧</span>
                <span>새 자녀 프로필 등록 (DB 연동)</span>
              </h3>
              <button
                onClick={() => setShowAddChildModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddChildSubmit} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 mb-1">
                  아이 별명 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 민우, 준이, 꿈돌이"
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">학년 선택 (초1 ~ 초6)</label>
                <select
                  value={newGrade}
                  onChange={(e) => setNewGrade(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-amber-400"
                >
                  <option value={1}>초등학교 1학년</option>
                  <option value={2}>초등학교 2학년</option>
                  <option value={3}>초등학교 3학년</option>
                  <option value={4}>초등학교 4학년</option>
                  <option value={5}>초등학교 5학년</option>
                  <option value={6}>초등학교 6학년</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">장래희망 / 꿈 (선택)</label>
                <input
                  type="text"
                  placeholder="예: 로봇 공학자, 과학자, 웹툰 작가"
                  value={newDreamJob}
                  onChange={(e) => setNewDreamJob(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 space-y-3">
                <label className="block text-amber-900 font-black">첫 도전 소원 선물 설정</label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="소원 선물 (예: 레고 블록)"
                      value={newWishTitle}
                      onChange={(e) => setNewWishTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="목표 P"
                      min={10}
                      max={1000}
                      value={newWishPoints}
                      onChange={(e) => setNewWishPoints(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddChildModal(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingChild}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 font-black text-xs shadow-md hover:scale-105 transition-transform disabled:opacity-50"
                >
                  {isSubmittingChild ? 'DB 저장 중...' : '🌱 자녀 프로필 DB 저장하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 자녀 프로필 수정 모달 */}
      {editingChild && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-[#FDFBF7] rounded-3xl border-2 border-amber-300 p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-amber-200 pb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>✏️</span>
                <span>자녀 프로필 정보 수정 (DB 연동)</span>
              </h3>
              <button
                onClick={() => setEditingChild(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditChildSubmit} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 mb-1">
                  아이 별명 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editNickname}
                  onChange={(e) => setEditNickname(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">학년 변경</label>
                <select
                  value={editGrade}
                  onChange={(e) => setEditGrade(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-amber-400"
                >
                  <option value={1}>초등학교 1학년</option>
                  <option value={2}>초등학교 2학년</option>
                  <option value={3}>초등학교 3학년</option>
                  <option value={4}>초등학교 4학년</option>
                  <option value={5}>초등학교 5학년</option>
                  <option value={6}>초등학교 6학년</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">장래희망 / 관심사</label>
                <input
                  type="text"
                  value={editDreamJob}
                  onChange={(e) => setEditDreamJob(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 space-y-3">
                <label className="block text-amber-900 font-black">도전 소원 선물 수정</label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={editWishTitle}
                      onChange={(e) => setEditWishTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      min={10}
                      max={1000}
                      value={editWishPoints}
                      onChange={(e) => setEditWishPoints(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingChild(null)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 font-black text-xs shadow-md hover:scale-105 transition-transform disabled:opacity-50"
                >
                  {isSubmittingEdit ? '수정 저장 중...' : '✏️ 프로필 정보 수정 완료'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 소원 승인 팝업 모달 */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-[#FDFBF7] rounded-3xl border-2 border-amber-300 p-6 shadow-2xl space-y-5">
            <div className="text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-100 text-4xl mb-2 border border-amber-300">
                🎁
              </div>
              <h3 className="text-xl font-black text-slate-900">소원상자 선물 승인</h3>
              <p className="text-xs text-slate-500 font-bold mt-1">
                {childName} 어린이가 학습 미션을 완료하여 모은 포인트를 DB 원장에서 정산하고 선물을 승인합니다.
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-amber-200 space-y-2 text-xs font-bold">
              <div className="flex justify-between text-slate-700">
                <span>신청 소원:</span>
                <span className="font-black text-amber-700">
                  {wishes.length > 0 ? wishes[0].title : '원하는 소원 선물 🎁'}
                </span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>차감 포인트:</span>
                <span className="font-black text-rose-600">-500 P</span>
              </div>
              <div className="flex justify-between text-slate-700 pt-1 border-t border-slate-100">
                <span>정산 후 남는 포인트:</span>
                <span className="font-black text-emerald-600">{childPoints - 500} P</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="px-5 py-2.5 rounded-2xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleApproveWish}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 font-black text-xs shadow-md hover:scale-105 transition-transform"
              >
                🎁 선물 승인 및 정산 완료
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

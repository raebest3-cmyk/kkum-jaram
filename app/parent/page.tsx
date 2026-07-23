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
  fetchWishes,
  fetchAchievedWishes,
  fetchChildQuizStats,
  approveWishAndCreateAlbum,
  getSelectedChildId,
  setSelectedChildId,
  ChildProfile,
  UserAccount,
  WishItem,
  ChildQuizStats,
  getUserApiKey
} from '@/lib/auth'

export default function ParentDashboardPage() {
  const [user, setUser] = useState<UserAccount | null>(null)
  const [children, setChildren] = useState<ChildProfile[]>([])
  const [selectedChildId, setSelectedChildIdState] = useState<string>('')
  const [hasApiKey, setHasApiKey] = useState<boolean>(false)

  // 소원 및 포인트 상태
  const [wishes, setWishes] = useState<WishItem[]>([])
  const [wishStatus, setWishStatus] = useState<'active' | 'achieved'>('active')
  const [childPoints, setChildPoints] = useState<number>(120)

  // DB 집계 통계 상태 (가상 데이터 전면 제거)
  const [quizStats, setQuizStats] = useState<ChildQuizStats>({
    weeklyQuestions: 0,
    accuracyRate: 0,
    studyHours: 0,
    conceptScores: [],
    weaknessPrescription: '아직 학습 기록이 없습니다.',
    aiSummary: '학습을 시작하면 AI 성장 총평이 제공됩니다.'
  })

  // 소원 승인 팝업 개편 모달 상태
  const [showApprovalModal, setShowApprovalModal] = useState<boolean>(false)
  const [deductPoints, setDeductPoints] = useState<number>(500)
  const [redemptionType, setRedemptionType] = useState<string>('포인트 교환 🎁')
  const [parentMessage, setParentMessage] = useState<string>('')
  const [proofImage, setProofImage] = useState<string>('')
  const [isApproving, setIsApproving] = useState<boolean>(false)

  // 추억 앨범 갤러리 모달 상태
  const [showAlbumModal, setShowAlbumModal] = useState<boolean>(false)
  const [achievedWishes, setAchievedWishes] = useState<WishItem[]>([])

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

  // Promise.all 병렬 처리를 통한 선택 자녀 DB 데이터 최적화 로딩
  const loadChildDataParallel = async (targetChild: ChildProfile) => {
    try {
      const [pts, wishList, achieved, stats] = await Promise.all([
        fetchChildPoints(targetChild.id),
        fetchWishes(targetChild.id),
        fetchAchievedWishes(targetChild.id),
        fetchChildQuizStats(targetChild.id, targetChild.grade)
      ])

      setChildPoints(pts)
      setWishes(wishList)
      if (wishList.length > 0 && wishList[0].status) {
        setWishStatus(wishList[0].status as 'active' | 'achieved')
      } else {
        setWishStatus('active')
      }
      setAchievedWishes(achieved)
      setQuizStats(stats)
    } catch (e) {
      console.warn('Parallel child data loading error:', e)
    }
  }

  const reloadChildren = async (accountId: string) => {
    const list = await fetchChildrenProfiles(accountId)
    setChildren(list)

    if (list.length > 0) {
      const savedId = getSelectedChildId()
      const found = list.find((c) => c.id === savedId)
      const target = found || list[0]

      setSelectedChildIdState(target.id)
      setSelectedChildId(target.id)
      await loadChildDataParallel(target)
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

  // 탭에서 자녀 선택 시
  const handleSelectChild = async (ch: ChildProfile) => {
    setSelectedChildIdState(ch.id)
    setSelectedChildId(ch.id)
    await loadChildDataParallel(ch)
  }

  // 인증사진 파일 선택 핸들러
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProofImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // 소원 승인 처리 핸들러
  const handleApproveWishSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (childPoints < deductPoints) {
      alert(`보유 선물 조각(${childPoints}개)보다 차감 선물 조각(${deductPoints}개)이 큽니다. 수량을 조율해 주세요!`)
      return
    }

    const currentChild = children.find((c) => c.id === selectedChildId)
    if (!currentChild) return

    setIsApproving(true)
    try {
      const wishId = wishes.length > 0 && wishes[0].id ? wishes[0].id : `wish-${Date.now()}`

      const updatedPoints = await approveWishAndCreateAlbum(
        wishId,
        currentChild.id,
        deductPoints,
        proofImage,
        parentMessage.trim() || '소원 달성을 축하해요! 항상 응원해 ⭐',
        redemptionType
      )

      setChildPoints(updatedPoints)
      setWishStatus('achieved')
      setShowApprovalModal(false)

      const userId = user?.id || 'demo-parent-uuid-001'
      await reloadChildren(userId)

      alert('🎉 소원 선물 승인 및 추억 앨범 보관이 완료되었습니다!')
    } catch (err) {
      console.error(err)
      alert('승인 처리 중 오류가 발생했습니다.')
    } finally {
      setIsApproving(false)
    }
  }

  // 자녀 추가 제출 핸들러
  const handleAddChildSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNickname.trim()) {
      alert('아이의 별명을 입력해 주세요!')
      return
    }

    setIsSubmittingChild(true)
    try {
      const userId = user?.id || 'demo-parent-uuid-001'
      const created = await createChildProfile(
        userId,
        newNickname.trim(),
        newGrade,
        newDreamJob.trim() || '꿈나무 🌟',
        newWishTitle.trim() || '소원 선물 상자 🎁',
        newWishPoints || 100
      )

      await reloadChildren(userId)
      if (created) {
        setSelectedChildIdState(created.id)
      }

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

  const selectedChild = children.find((c) => c.id === selectedChildId) || (children.length > 0 ? children[0] : null)
  const childName = selectedChild?.nickname || '수빈이'
  const dreamJob = selectedChild?.dream_job || '꿈나무 🌟'
  const currentGrade = selectedChild?.grade || 3

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
                Supabase Auth Direct DB
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              현재 로그인한 계정에 연동된 실제 DB 데이터를 실시간 집계한 분석 리포트입니다.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={() => setShowAlbumModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xs hover:scale-105 transition-transform shadow-md flex items-center gap-1.5"
            >
              <span>📸</span>
              <span>추억 앨범 갤러리 ({achievedWishes.length})</span>
            </button>
          </div>
        </header>

        {/* 🌟 자녀 선택, 추가, 수정, 삭제 단일 통합 관리 카드 영역 */}
        <section className="bg-white rounded-3xl p-6 border border-amber-200/80 shadow-xl shadow-amber-900/5 space-y-4">
          <div className="flex justify-between items-center border-b border-amber-100 pb-3">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <span>👦👧</span>
              <span>자녀 프로필 선택 & 관리 ({children.length}명)</span>
            </h2>
            <button
              onClick={() => setShowAddChildModal(true)}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 text-[#00205b] font-black text-xs hover:scale-105 transition-transform shadow-md flex items-center gap-1"
            >
              <span>+ 새 자녀 추가</span>
            </button>
          </div>

          {children.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {children.map((ch) => {
                const isSelected = ch.id === selectedChildId
                return (
                  <div
                    key={ch.id}
                    className={`rounded-2xl p-4 border flex flex-col justify-between gap-3 transition-all ${
                      isSelected
                        ? 'bg-[#FFFDF9] border-amber-400 ring-2 ring-amber-300 shadow-md'
                        : 'bg-[#FAF8F5] border-amber-200/80 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div
                        onClick={() => handleSelectChild(ch)}
                        className="cursor-pointer flex-1"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black text-slate-900">{ch.nickname}</span>
                          <span className="text-[11px] bg-[#003087] text-[#C8A951] px-2 py-0.5 rounded-full font-black">
                            초등 {ch.grade}학년
                          </span>
                          {isSelected && (
                            <span className="text-[10px] bg-emerald-500 text-white font-black px-2 py-0.5 rounded-full">
                              선택됨 ✓
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-bold mt-1">
                          희망: {ch.dream_job || '꿈나무 🌟'}
                        </p>
                      </div>

                      {/* 수정 ✏️ / 삭제 🗑️ 버튼 */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(ch)}
                          title="프로필 수정"
                          className="px-2 py-1 rounded-xl bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold shadow-sm"
                        >
                          ✏️ 수정
                        </button>
                        <button
                          onClick={() => handleDeleteChild(ch)}
                          title="프로필 삭제"
                          className="px-2 py-1 rounded-xl bg-white hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold shadow-sm"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-amber-200/50 flex justify-between items-center">
                      <button
                        onClick={() => handleSelectChild(ch)}
                        className={`text-xs font-black ${isSelected ? 'text-amber-700' : 'text-slate-500 hover:text-amber-800'}`}
                      >
                        {isSelected ? '📊 데이터 리포트 표시 중' : '리포트 선택 →'}
                      </button>
                      <Link
                        href="/child"
                        className="text-xs font-black text-[#003087] hover:underline"
                      >
                        아이 뷰 →
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500 text-xs font-bold space-y-2">
              <p>등록된 자녀 프로필이 없습니다.</p>
              <button
                onClick={() => setShowAddChildModal(true)}
                className="px-4 py-2 rounded-xl bg-amber-400 text-amber-950 font-black text-xs shadow-sm hover:scale-105 transition-transform"
              >
                + 지금 자녀 프로필 추가하기
              </button>
            </div>
          )}
        </section>

        <main className="space-y-8">
          {/* 1. 선택한 자녀의 실제 DB 집계 주간 성취도 요약 */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white rounded-3xl p-5 border border-amber-200/60 shadow-md flex flex-col justify-between">
              <span className="text-xs font-extrabold text-slate-500">{childName}의 주간 풀이 문항</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900">{quizStats.weeklyQuestions}</span>
                <span className="text-xs font-bold text-slate-500">문제</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 mt-2">DB 실시간 풀이 집계</span>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-amber-200/60 shadow-md flex flex-col justify-between">
              <span className="text-xs font-extrabold text-slate-500">{childName}의 주간 정답률</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-black text-emerald-600">
                  {quizStats.weeklyQuestions > 0 ? `${quizStats.accuracyRate}%` : '-'}
                </span>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 mt-2">⭐ DB 채점 데이터 분석</span>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-amber-200/60 shadow-md flex flex-col justify-between">
              <span className="text-xs font-extrabold text-slate-500">{childName}의 선물 조각 보유</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-black text-amber-600">🧩 {childPoints}</span>
                <span className="text-xs font-bold text-slate-500">개</span>
              </div>
              <span className="text-[11px] font-bold text-amber-700 mt-2">
                {childPoints >= 500 ? '목표 500개 달성 🎉' : '선물 상자 조각 모으기 중'}
              </span>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-amber-200/60 shadow-md flex flex-col justify-between">
              <span className="text-xs font-extrabold text-slate-500">{childName}의 누적 학습시간</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-black text-indigo-600">{quizStats.studyHours}</span>
                <span className="text-xs font-bold text-slate-500">시간</span>
              </div>
              <span className="text-[11px] font-bold text-indigo-600 mt-2">자기주도 집계 시간</span>
            </div>
          </section>

          {/* 2. 선택 자녀 맞춤 단원별 약점 분석 & AI 성장 총평 (실제 DB 연동) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-amber-200/60 shadow-xl shadow-amber-900/5 space-y-5">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>📊</span>
                  <span>{childName}의 단원별 약점 개념 분석</span>
                </h2>
                <span className="text-xs font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
                  초등 {currentGrade}학년 수학
                </span>
              </div>

              <div className="space-y-4">
                {quizStats.conceptScores.map((c, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-800">{c.name}</span>
                      <span className={c.rate >= 80 ? 'text-emerald-600' : c.rate >= 60 ? 'text-amber-600' : 'text-rose-600'}>
                        {c.rate}% ({c.status})
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          c.rate >= 80
                            ? 'bg-gradient-to-r from-emerald-400 to-[#0D8A68]'
                            : c.rate >= 60
                            ? 'bg-gradient-to-r from-amber-400 to-orange-400'
                            : 'bg-gradient-to-r from-rose-400 to-pink-500'
                        }`}
                        style={{ width: `${c.rate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-rose-50/80 rounded-2xl p-4 border border-rose-200 text-xs text-rose-900 font-bold leading-relaxed">
                💡 <strong>약점 분석 처방:</strong> {quizStats.weaknessPrescription}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-amber-200/60 shadow-xl shadow-amber-900/5 space-y-5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <span>📝</span>
                    <span>{childName}의 AI 주간 성장 총평</span>
                  </h2>
                  <span className="text-xs font-bold bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full">
                    실시간 DB 분석
                  </span>
                </div>

                <div className="mt-4 bg-[#FFF8E7] rounded-2xl p-5 border border-[#FDE68A] space-y-3 text-xs sm:text-sm text-slate-800 font-bold leading-relaxed">
                  <p className="text-amber-950">
                    "{childName} 어린이는 초등 {currentGrade}학년 학습 미션을 수행 중입니다."
                  </p>
                  <p className="text-slate-700 font-medium leading-relaxed">
                    {quizStats.aiSummary}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs font-extrabold text-amber-800 flex items-center justify-between">
                <span>AI 지능형 리포트 발급 완료</span>
                <span>실시간 데이터 갱신</span>
              </div>
            </div>
          </div>

          {/* 3. 선택 자녀 소원상자 승인 & 선물 조각 수량 관리 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-amber-200/60 shadow-lg shadow-amber-900/5 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span>🎁</span>
                  <span>{childName}의 소원상자 승인 & 선물 조각 정산</span>
                </h3>
                <span
                  className={`text-xs px-3 py-1 rounded-full font-black ${
                    wishStatus === 'achieved'
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}
                >
                  {wishStatus === 'achieved' ? '선물 승인완료 🎉' : '목표 조각 500개 달성'}
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
                  <span>목표 / 보유 선물 조각:</span>
                  <span className="font-black text-slate-900">500개 / {childPoints}개 모음</span>
                </div>
              </div>

              <div className="pt-1 flex gap-2">
                {wishStatus === 'active' ? (
                  <button
                    onClick={() => setShowApprovalModal(true)}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-amber-950 font-black text-xs shadow-md hover:scale-[1.02] transition-all"
                  >
                    🎁 {childName}의 소원 선물 승인 및 정산하기
                  </button>
                ) : (
                  <div className="w-full flex justify-between items-center p-3 text-xs font-black text-emerald-800 bg-emerald-50 rounded-2xl border border-emerald-200">
                    <span>🎉 선물 승인이 완료되어 가족 꿈 앨범에 보관되었습니다.</span>
                    <button
                      onClick={() => setShowAlbumModal(true)}
                      className="px-3 py-1 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shrink-0 ml-2"
                    >
                      📸 앨범 보기
                    </button>
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

      {/* 소원 선물 승인 팝업 모달 */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-[#FDFBF7] rounded-3xl border-2 border-amber-300 p-6 shadow-2xl space-y-5 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-amber-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎁</span>
                <h3 className="text-lg font-black text-slate-900">{childName}의 소원상자 선물 승인</h3>
              </div>
              <button
                onClick={() => setShowApprovalModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApproveWishSubmit} className="space-y-4 text-xs font-bold">
              <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200 space-y-3">
                <div className="flex justify-between items-center text-amber-900 font-black">
                  <span>신청 소원 선물:</span>
                  <span className="text-amber-700 font-black">
                    {wishes.length > 0 ? wishes[0].title : '어린이 선물 세트 🎁'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-slate-600 mb-1">차감할 선물 조각 (수정 가능)</label>
                    <input
                      type="number"
                      min={0}
                      max={childPoints}
                      value={deductPoints}
                      onChange={(e) => setDeductPoints(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-amber-600 font-black text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">정산 후 남는 조각 (자동계산)</label>
                    <div className="px-3 py-2.5 bg-white rounded-xl border border-slate-200 text-emerald-600 font-black text-sm">
                      {Math.max(0, childPoints - deductPoints)}개
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">정산 유형 선택</label>
                <select
                  value={redemptionType}
                  onChange={(e) => setRedemptionType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-bold"
                >
                  <option value="선물 조각 교환 🎁">선물 조각 교환 🎁 (실물 선물 전달)</option>
                  <option value="상품권/현물 💳">상품권 / 기프티콘 지급 💳</option>
                  <option value="체험/소원 달성 🌟">가족 야외 체험 / 소원 달성 🌟</option>
                  <option value="기타 정산 🎈">기타 축하 선물 🎈</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">부모님의 축하 메시지 (추억 앨범 저장)</label>
                <textarea
                  rows={2}
                  placeholder={`예: ${childName}아, 열심히 선물 조각 500개를 모아 소원을 이룬 것을 축하해! 사랑해 ❤️`}
                  value={parentMessage}
                  onChange={(e) => setParentMessage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">📸 선물 전달 인증사진 첨부 (선택)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-amber-100 file:text-amber-900 hover:file:bg-amber-200"
                />

                {proofImage && (
                  <div className="mt-3 relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-amber-300 shadow-sm mx-auto">
                    <img src={proofImage} alt="인증샷 미리보기" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowApprovalModal(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isApproving}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 font-black text-xs shadow-md hover:scale-105 transition-transform disabled:opacity-50"
                >
                  {isApproving ? '정산 및 저장 중...' : '🎁 승인 완료 및 추억 앨범에 저장'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                      placeholder="목표 조각개수"
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
                <p className="text-sm font-bold">아직 {childName}의 보관된 소원 달성 추억 앨범이 없습니다.</p>
                <p className="text-xs text-slate-400">
                  아이가 500개 선물 조각을 모아 소원을 달성하고 부모가 승인하면 여기에 예쁜 인증샷 갤러리가 보관됩니다!
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

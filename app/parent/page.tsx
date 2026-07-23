'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import {
  getCurrentUser,
  fetchChildrenProfiles,
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

  useEffect(() => {
    async function loadData() {
      const u = await getCurrentUser()
      setUser(u)

      if (u) {
        // Supabase DB 자녀 프로필 실시간 Fetch
        const list = await fetchChildrenProfiles(u.id)
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
      // DB 포인트 차감 및 소원 상태 갱신
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
            <Link
              href="/onboarding"
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 text-[#00205b] font-black text-xs hover:scale-105 transition-transform shadow-md"
            >
              + 아이 프로필 추가
            </Link>
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

          {/* 2. 등록된 자녀 프로필 세션 */}
          <section className="bg-white rounded-3xl p-6 sm:p-7 border border-amber-200/60 shadow-xl shadow-amber-900/5 space-y-4">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span>👦👧</span>
              <span>DB 연동된 자녀 프로필 ({children.length}명)</span>
            </h2>

            {children.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {children.map((ch) => (
                  <div
                    key={ch.id}
                    className="bg-[#FAF8F5] rounded-2xl p-5 border border-amber-200/80 flex justify-between items-center"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-slate-900">{ch.nickname}</span>
                        <span className="text-xs bg-[#003087] text-[#C8A951] px-2.5 py-0.5 rounded-full font-black">
                          초등 {ch.grade}학년
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-bold mt-1">
                        장래희망: {ch.dream_job || '요리사 👨‍🍳'} | 보유 포인트: 🪙 {childPoints} P
                      </p>
                    </div>

                    <Link
                      href="/child"
                      className="px-3.5 py-2 rounded-xl bg-white hover:bg-amber-100 text-xs font-black text-amber-900 border border-amber-300 transition-colors shadow-sm"
                    >
                      학습 대시보드 뷰 →
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-sm font-bold">
                등록된 자녀 프로필이 없습니다.{' '}
                <Link href="/onboarding" className="text-amber-700 underline font-black">
                  온보딩에서 추가하기
                </Link>
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
                💡 <strong>약점 분석 처방:</strong> 단위분수 크기 비교(1/4 과 1/6)에서 분모가 클수록 작아지는 원리를 더 다질 필요가 있습니다.
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
                    "아이 요리사는 이번 주 <strong>세 자리 수 덧셈·뺄셈</strong> 단원을 높은 정답률로 완벽히 마스터하였습니다!"
                  </p>
                  <p className="text-slate-700 font-medium">
                    특히 <strong>AI 말로 설명하기 미션</strong>에서 음성(STT)으로 나눗셈을 '음식을 똑같이 나누어 담는 요리 레시피'에 비유하여 설명하는 메타인지 능력이 매우 뛰어납니다.
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
                    {wishes.length > 0 ? wishes[0].title : '어린이 쉐프 요리 도구 세트 👨‍🍳'}
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
                Anthropic API 키를 설정하면 Edge Function을 통해 AI 오답 분석 및 맞춤 피드백 기능이 활성화됩니다.
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
                학습 미션을 완료하여 모은 포인트를 DB 원장에서 정산하고 선물을 승인합니다.
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-amber-200 space-y-2 text-xs font-bold">
              <div className="flex justify-between text-slate-700">
                <span>신청 소원:</span>
                <span className="font-black text-amber-700">어린이 쉐프 요리 도구 세트 👨‍🍳</span>
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

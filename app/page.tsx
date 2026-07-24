'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { getCurrentUser, fetchChildrenProfiles, UserAccount, ChildProfile } from '@/lib/auth'

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<UserAccount | null>(null)
  const [children, setChildren] = useState<ChildProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkUser() {
      const u = await getCurrentUser()
      setUser(u)
      if (u) {
        const childList = await fetchChildrenProfiles(u.id)
        setChildren(childList)
      }
      setLoading(false)
    }
    checkUser()
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <Navbar />

      {/* 히어로 세션 */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#001845] via-[#00205b] to-slate-950">
        <div className="max-w-4xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#C8A951]/20 border border-[#C8A951]/40 px-4 py-1.5 text-xs font-extrabold text-[#C8A951]">
            <span>✨ 초등~고등 통합 자기주도학습 관리 플랫폼</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            아이의 메타인지와 꿈이 <br />
            <span className="bg-gradient-to-r from-[#C8A951] via-amber-300 to-yellow-500 bg-clip-text text-transparent">
              함께 자라는 터전
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed">
            등수와 비교 대신 개념 숙달률과 성장을 눈으로 확인하세요. <br className="hidden sm:inline" />
            AI 기반 오답 분석과 간격반복 복습으로 진짜 실력을 길러줍니다.
          </p>

          {/* CTA 버튼 그룹 */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            {!loading && user ? (
              children.length > 0 ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/child"
                    className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#C8A951] to-amber-400 hover:from-[#d8b95f] hover:to-amber-300 text-[#00205b] font-extrabold text-base shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
                  >
                    <span>👧</span>
                    <span>아이 모드 학습 시작하기</span>
                  </Link>
                  <Link
                    href="/parent"
                    className="px-8 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-[#C8A951]/40 text-slate-200 font-bold text-base transition-all flex items-center justify-center gap-2"
                  >
                    <span>👨‍👩‍👧</span>
                    <span>부모 모드 대시보드</span>
                  </Link>
                </div>
              ) : (
                <Link
                  href="/onboarding"
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#C8A951] to-amber-400 hover:from-[#d8b95f] hover:to-amber-300 text-[#00205b] font-extrabold text-base shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  <span>🚀</span>
                  <span>아이 프로필 등록 온보딩 진행</span>
                </Link>
              )
            ) : (
              <Link
                href="/login"
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#C8A951] to-amber-400 hover:from-[#d8b95f] hover:to-amber-300 text-[#00205b] font-extrabold text-base shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <span>🔑</span>
                <span>부모 로그인 및 온보딩 시작</span>
              </Link>
            )}
          </div>

          {/* 주요 3대 특장점 카드리스트 */}
          <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 hover:border-[#C8A951]/40 transition-colors">
              <div className="text-3xl mb-3">📈</div>
              <h3 className="text-lg font-bold text-white mb-2">성장 중심 지표</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                평균이나 등수가 아닌 단원별 개념 숙달률 곡선과 약점 극복 그래프를 한눈에 파악합니다.
              </p>
            </div>

            <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 hover:border-[#C8A951]/40 transition-colors">
              <div className="text-3xl mb-3">🧠</div>
              <h3 className="text-lg font-bold text-white mb-2">출력 중심 AI 복습</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                틀린 개념은 간격반복(SRS)으로 재출제하며, 아이 눈높이에맞는 오답 피드백을 제공합니다.
              </p>
            </div>

            <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 hover:border-[#C8A951]/40 transition-colors">
              <div className="text-3xl mb-3">🎁</div>
              <h3 className="text-lg font-bold text-white mb-2">가족 융합형 보상</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                학습 미션으로 포인트를 모아 소원 상자를 달성하고 부모 승인과 인증샷으로 가족 추억을 만듭니다.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        우리아이 꿈 자람 터 (v4.0 MVP) · 초등 3학년 수학 시드 패키지
      </footer>
    </div>
  )
}

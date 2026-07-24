'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import {
  getCurrentUser,
  fetchChildrenProfiles,
  getSelectedChildId,
  logoutUser,
  UserAccount,
  ChildProfile
} from '@/lib/auth'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<UserAccount | null>(null)
  const [children, setChildren] = useState<ChildProfile[]>([])
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null)
  const [mode, setMode] = useState<'parent' | 'child'>('child')

  const refreshChildProfile = (childList: ChildProfile[]) => {
    if (childList.length > 0) {
      const savedId = getSelectedChildId()
      const found = childList.find((c: ChildProfile) => c.id === savedId)
      setSelectedChild(found || childList[0])
    } else {
      setSelectedChild(null)
    }
  }

  useEffect(() => {
    async function loadSession() {
      const u = await getCurrentUser()
      setUser(u)
      if (u) {
        const childList = await fetchChildrenProfiles(u.id)
        setChildren(childList)
        refreshChildProfile(childList)
      }
    }
    loadSession()

    if (pathname.startsWith('/parent')) {
      setMode('parent')
    } else {
      setMode('child')
    }

    // 전역 자녀 변경 이벤트 핸들러
    const handleChildChange = async (e: any) => {
      const u = await getCurrentUser()
      if (u) {
        const childList = await fetchChildrenProfiles(u.id)
        setChildren(childList)

        const targetId = e?.detail?.childId || getSelectedChildId()
        if (childList.length > 0) {
          const found = childList.find((c: ChildProfile) => c.id === targetId)
          setSelectedChild(found || childList[0])
        }
      }
    }

    window.addEventListener('kkum_jaram_child_changed', handleChildChange)
    return () => {
      window.removeEventListener('kkum_jaram_child_changed', handleChildChange)
    }
  }, [pathname])

  const handleLogout = async () => {
    await logoutUser()
    setUser(null)
    router.push('/login')
  }

  const isChildMode = mode === 'child'

  return (
    <header
      className={`sticky top-0 z-50 transition-all border-b ${
        isChildMode
          ? 'bg-[#FDFBF7]/95 backdrop-blur-md border-amber-200/60 shadow-sm text-slate-800'
          : 'bg-[#003087] text-white border-transparent shadow-md'
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 gap-2">
        {/* 브랜드 로고 */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div
            className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-2xl font-bold text-lg sm:text-xl shadow-sm group-hover:scale-105 transition-transform ${
              isChildMode
                ? 'bg-gradient-to-tr from-amber-300 to-amber-200 text-[#003087] border border-amber-300'
                : 'bg-[#C8A951] text-[#003087]'
            }`}
          >
            🌱
          </div>
          <div>
            <span
              className={`text-base sm:text-lg font-black tracking-tight transition-colors ${
                isChildMode ? 'text-[#00205b]' : 'text-white'
              }`}
            >
              꿈 자람 터
            </span>
            <span
              className={`ml-1.5 hidden md:inline-block text-[10px] sm:text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                isChildMode
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-[#C8A951]/20 text-[#C8A951]'
              }`}
            >
              {selectedChild ? `초등 ${selectedChild.grade}학년 수학 ✦` : '초등 수학 ✦'}
            </span>
          </div>
        </Link>

        {/* 중앙 모드 스위처 */}
        {user && (
          <div
            className={`flex items-center rounded-full p-1 border shadow-inner ${
              isChildMode
                ? 'bg-amber-100/70 border-amber-200/80'
                : 'bg-[#00205b] border-[#C8A951]/30'
            }`}
          >
            <button
              onClick={() => {
                setMode('child')
                router.push('/child')
              }}
              className={`flex items-center gap-1 rounded-full px-2.5 sm:px-4 py-1 text-[11px] sm:text-xs font-black transition-all ${
                mode === 'child'
                  ? 'bg-white text-emerald-700 shadow-md scale-105'
                  : isChildMode
                  ? 'text-amber-800 hover:text-amber-950'
                  : 'text-zinc-300 hover:text-white'
              }`}
            >
              <span>👧</span>
              <span>아이 모드</span>
            </button>
            <button
              onClick={() => {
                setMode('parent')
                router.push('/parent')
              }}
              className={`flex items-center gap-1 rounded-full px-2.5 sm:px-4 py-1 text-[11px] sm:text-xs font-black transition-all ${
                mode === 'parent'
                  ? 'bg-[#003087] text-amber-300 shadow-md scale-105'
                  : isChildMode
                  ? 'text-amber-800 hover:text-amber-950'
                  : 'text-zinc-300 hover:text-white'
              }`}
            >
              <span>👨‍👩‍👧</span>
              <span>부모 모드</span>
            </button>
          </div>
        )}

        {/* 우측 프로필 및 설정 */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* 전역 실시간 동기화되는 Header 프로필 뱃지 */}
              {selectedChild && (
                <div
                  className={`flex items-center gap-1.5 rounded-2xl px-3 py-1 text-xs border shadow-sm transition-all ${
                    isChildMode
                      ? 'bg-white border-amber-200 text-slate-800'
                      : 'bg-[#00205b] border-[#C8A951]/40 text-[#C8A951]'
                  }`}
                >
                  <span className="text-sm">{selectedChild.grade <= 3 ? '👧' : '👦'}</span>
                  <span className="font-black">{selectedChild.nickname}</span>
                  <span className="text-[11px] opacity-80">(초{selectedChild.grade})</span>
                </div>
              )}

              {children.length === 0 && (
                <Link
                  href="/onboarding"
                  className="rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 px-3 py-1 text-xs font-black text-[#003087] shadow-sm hover:scale-105 transition-transform"
                >
                  + 프로필 등록
                </Link>
              )}

              <button
                onClick={handleLogout}
                className={`text-[11px] sm:text-xs font-medium px-1.5 py-1 transition-colors ${
                  isChildMode ? 'text-slate-500 hover:text-slate-800' : 'text-white/80 hover:text-white'
                }`}
              >
                로그아웃
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 px-3.5 sm:px-4 py-1.2 text-xs font-black text-[#003087] shadow-sm hover:scale-105 transition-transform"
            >
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

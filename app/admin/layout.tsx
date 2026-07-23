'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getCurrentUser, logoutUser, UserAccount } from '@/lib/auth'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<UserAccount | null>(null)

  useEffect(() => {
    async function checkUser() {
      const u = await getCurrentUser()
      setUser(u)
    }
    checkUser()
  }, [])

  const handleLogout = async () => {
    await logoutUser()
    setUser(null)
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* ⚡ 관리자 포털 전용 독립 다크 헤더 */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="flex items-center gap-2 font-black text-lg sm:text-xl text-white tracking-tight hover:opacity-90">
            <span className="text-2xl">⚡</span>
            <span>꿈 자람 터 관리자 포털</span>
          </Link>
          <span className="hidden sm:inline-block text-[11px] font-extrabold bg-[#C8A951]/20 border border-[#C8A951]/40 text-[#C8A951] px-2.5 py-0.5 rounded-full">
            Admin Console
          </span>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="hidden sm:inline text-slate-400">
                <strong className="text-white font-extrabold">{user.display_name || user.email}</strong> 님 (관리자)
              </span>
              <button
                onClick={handleLogout}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 border border-slate-700 text-xs font-bold transition-all"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <Link
              href="/admin/login"
              className="px-3.5 py-1.5 rounded-xl bg-[#C8A951] text-[#00205b] font-bold text-xs hover:bg-amber-300 transition-all shadow"
            >
              관리자 로그인
            </Link>
          )}

          <Link
            href="/parent"
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition-all flex items-center gap-1"
          >
            <span>일반 서비스로 이동</span>
            <span>→</span>
          </Link>
        </div>
      </header>

      {/* 메인 콘솔 콘텐츠 영역 */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}

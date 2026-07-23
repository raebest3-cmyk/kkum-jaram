'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginWithEmail } from '@/lib/auth'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setErrorMsg('이메일과 비밀번호를 모두 입력해 주세요.')
      return
    }

    setLoading(true)
    setErrorMsg('')

    try {
      const user = await loginWithEmail(email, password)

      if (user?.role !== 'admin') {
        setErrorMsg('🔒 관리자 승인이 완료된 계정만 진입 가능합니다. (기본 권한: 부모)')
        return
      }

      router.push('/admin')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '인증 처리 중 오류가 발생했습니다.'
      setErrorMsg(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-[calc(100vh-65px)] flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-slate-950 via-[#001845] to-slate-950">
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-md rounded-3xl border border-[#C8A951]/40 p-8 shadow-2xl relative overflow-hidden">
        {/* 상단 장식 선 */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#003087] via-[#C8A951] to-[#003087]" />

        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#C8A951]/20 border border-[#C8A951]/40 text-3xl mb-3">
            ⚡
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            독립 관리자 로그인 게이트웨이
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            꿈 자람 터 관리자 시스템(CMS) 전용 로그인 화면입니다.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs font-bold leading-relaxed">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold">
          <div>
            <label className="block text-slate-300 mb-1">관리자 이메일 주소</label>
            <input
              type="email"
              placeholder="admin@kkumjaram.kr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-[#C8A951] text-sm"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1">비밀번호</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-[#C8A951] text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#003087] via-[#004bb7] to-[#C8A951] hover:from-[#002870] hover:to-[#003da3] border border-[#C8A951]/40 text-white font-black text-sm shadow-lg transition-all disabled:opacity-50 mt-2"
          >
            {loading ? '인증 처리 중...' : '⚡ 관리자 대시보드 로그인'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500 font-medium">
          ※ 승인되지 않은 일반 부모 계정은 진입이 차단됩니다.
        </div>
      </div>
    </main>
  )
}

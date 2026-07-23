'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { loginWithEmail, registerParentAccount, fetchChildrenProfiles } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
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
      let loggedUser: any
      if (isSignUp) {
        loggedUser = await registerParentAccount(email, displayName || email.split('@')[0], password)
      } else {
        loggedUser = await loginWithEmail(email, password)
      }

      // 아이 프로필이 이미 등록되어 있는지 확인
      const children = await fetchChildrenProfiles(loggedUser.id)
      if (children.length === 0) {
        router.push('/onboarding')
      } else {
        router.push('/child')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '인증 중 오류가 발생했습니다.'
      setErrorMsg(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 font-sans">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-[#001845] via-[#00205b] to-slate-950">
        <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-md rounded-2xl border border-[#C8A951]/30 p-8 shadow-2xl relative overflow-hidden">
          {/* 상단 골드 장식 선 */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#003087] via-[#C8A951] to-[#003087]" />

          {/* 타이틀 헤더 */}
          <div className="text-center mb-8">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#C8A951]/20 border border-[#C8A951]/40 text-3xl mb-3">
              🌱
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              {isSignUp ? '부모 회원가입' : '부모 로그인'}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              우리아이 꿈 자람 터에서 자기주도학습을 시작하세요
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* 폼 영역 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  부모님 닉네임 / 성함
                </label>
                <input
                  type="text"
                  placeholder="예: 민우 엄마"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-[#C8A951] text-sm"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                이메일 주소
              </label>
              <input
                type="email"
                placeholder="parent@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-[#C8A951] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                비밀번호
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-[#C8A951] text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#003087] to-[#004bb7] hover:from-[#002870] hover:to-[#003da3] border border-[#C8A951]/40 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50 mt-2"
            >
              {loading ? '처리 중...' : isSignUp ? '회원가입 완료 후 시작하기' : '로그인하기'}
            </button>
          </form>

          {/* 가입/로그인 전환 하단 텍스트 */}
          <div className="mt-6 text-center text-xs text-slate-400">
            {isSignUp ? '이미 계정이 있으신가요?' : '아직 계정이 없으신가요?'}{' '}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setErrorMsg('')
              }}
              className="text-[#C8A951] font-bold underline ml-1 hover:text-amber-300"
            >
              {isSignUp ? '로그인 하기' : '부모 회원가입'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

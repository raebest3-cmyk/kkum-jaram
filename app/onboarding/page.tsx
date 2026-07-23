'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { getCurrentUser, createChildProfile, saveUserApiKey, UserAccount } from '@/lib/auth'

export default function OnboardingPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserAccount | null>(null)
  const [step, setStep] = useState<number>(1)

  // Step 1: 부모 API Key (BYOK)
  const [apiKey, setApiKey] = useState('')

  // Step 2: 아이 프로필
  const [nickname, setNickname] = useState('')
  const [grade, setGrade] = useState<number>(3) // 기본 초등 3학년
  const [dreamJob, setDreamJob] = useState('')

  // Step 3: 첫 소원 설정
  const [wishTitle, setWishTitle] = useState('')
  const [wishPoints, setWishPoints] = useState<number>(100)

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      const u = await getCurrentUser()
      if (!u) {
        // 미로그인 시 로그인 페이지로
        router.push('/login')
      } else {
        setUser(u)
      }
    }
    checkAuth()
  }, [router])

  const handleNextStep = () => {
    if (step === 2 && !nickname) {
      alert('아이의 별명을 입력해 주세요!')
      return
    }
    setStep((prev) => prev + 1)
  }

  const handlePrevStep = () => {
    setStep((prev) => Math.max(1, prev - 1))
  }

  const handleFinishOnboarding = async () => {
    if (!nickname) {
      alert('아이의 별명을 입력해 주세요.')
      setStep(2)
      return
    }

    setLoading(true)
    try {
      if (user) {
        // API 키 저장 (있을 경우)
        if (apiKey.trim()) {
          await saveUserApiKey(user.id, apiKey.trim())
        }

        // 아이 프로필 및 소원 상자 등록
        await createChildProfile(
          user.id,
          nickname,
          grade,
          dreamJob || '탐험가',
          wishTitle || '레고 블록 세트',
          wishPoints || 100
        )
      }

      // 등록 완료 후 아이 모드 학습 대시보드로 이동
      router.push('/child')
    } catch (e) {
      console.error(e)
      alert('등록 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-[#001845] via-[#00205b] to-slate-950">
        <div className="w-full max-w-xl bg-slate-900/90 backdrop-blur-md rounded-2xl border border-[#C8A951]/40 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* 상단 프로그레스 바 */}
          <div className="mb-8">
            <div className="flex justify-between items-center text-xs font-bold text-[#C8A951] mb-2">
              <span>단계 {step} / 3</span>
              <span>
                {step === 1 ? '부모 설정 (BYOK)' : step === 2 ? '아이 프로필' : '첫 소원상자 설정'}
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#003087] via-[#C8A951] to-amber-300 h-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>

          {/* Step 1: 부모 설정 (Anthropic API Key) */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="text-center sm:text-left">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>🔑</span>
                  <span>부모님 API 키 입력 (BYOK)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  AI 기반 개인 맞춤 오답 분석과 대화를 위해 Anthropic API Key를 설정합니다. (나중에 설정 가능)
                </p>
              </div>

              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Anthropic API Key (sk-ant-...)
                  </label>
                  <input
                    type="password"
                    placeholder="sk-ant-api03-..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:border-[#C8A951] focus:outline-none"
                  />
                </div>
                <div className="text-[11px] text-amber-300/80 flex items-start gap-1.5">
                  <span>🛡️</span>
                  <span>
                    API 키는 서버 안전 암호화 테이블(`user_secrets`)에만 보존되며 클라이언트로 노출되지 않습니다.
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={handleNextStep}
                  className="px-6 py-2.5 rounded-xl bg-[#C8A951] hover:bg-[#d8b95f] text-[#00205b] font-bold text-sm transition-colors shadow"
                >
                  다음 단계로 이동 →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: 아이 프로필 등록 */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="text-center sm:text-left">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>👦👧</span>
                  <span>아이 프로필 등록</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  학습 데이터 기록을 위한 아이의 별명과 학년을 선택해 주세요.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    아이 별명 (실명 대신 사용) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="예: 민우, 꿈돌이, 준이"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:border-[#C8A951] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    학년 선택 (초1 ~ 고3)
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:border-[#C8A951] focus:outline-none"
                  >
                    <option value={1}>초등학교 1학년</option>
                    <option value={2}>초등학교 2학년</option>
                    <option value={3}>초등학교 3학년 (추천 기본)</option>
                    <option value={4}>초등학교 4학년</option>
                    <option value={5}>초등학교 5학년</option>
                    <option value={6}>초등학교 6학년</option>
                    <option value={7}>중학교 1학년</option>
                    <option value={8}>중학교 2학년</option>
                    <option value={9}>중학교 3학년</option>
                    <option value={10}>고등학교 1학년</option>
                    <option value={11}>고등학교 2학년</option>
                    <option value={12}>고등학교 3학년</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    장래희망 / 관심사 (선택)
                  </label>
                  <input
                    type="text"
                    placeholder="예: 우주비행사, 로봇공학자, 웹툰 작가"
                    value={dreamJob}
                    onChange={(e) => setDreamJob(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:border-[#C8A951] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-between gap-3 pt-4">
                <button
                  onClick={handlePrevStep}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-colors"
                >
                  ← 이전
                </button>
                <button
                  onClick={handleNextStep}
                  className="px-6 py-2.5 rounded-xl bg-[#C8A951] hover:bg-[#d8b95f] text-[#00205b] font-bold text-sm transition-colors shadow"
                >
                  다음 단계 (소원 상자) →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: 첫 소원 상자 설정 및 완료 */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="text-center sm:text-left">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>🎁</span>
                  <span>첫 소원상자 설정</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  아이가 미션을 완료하여 모은 포인트로 달성할 첫 선물 소원을 입력해 주세요!
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    소원 목표 제목
                  </label>
                  <input
                    type="text"
                    placeholder="예: 원하는 보드게임 세트, 주말 놀이공원 가기"
                    value={wishTitle}
                    onChange={(e) => setWishTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:border-[#C8A951] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    목표 포인트 (기본 100점)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={5000}
                    step={10}
                    value={wishPoints}
                    onChange={(e) => setWishPoints(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:border-[#C8A951] focus:outline-none"
                  />
                </div>

                <div className="bg-[#C8A951]/10 rounded-xl p-4 border border-[#C8A951]/30 text-xs text-amber-200">
                  <p className="font-bold mb-1">🎉 온보딩 준비 완료!</p>
                  <p className="text-slate-300">
                    프로필과 소원상자 설정이 끝나면 바로 초등 3학년 수학 학습 미션과 맞춤 대시보드를 이용할 수 있습니다.
                  </p>
                </div>
              </div>

              <div className="flex justify-between gap-3 pt-4">
                <button
                  onClick={handlePrevStep}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-colors"
                >
                  ← 이전
                </button>
                <button
                  onClick={handleFinishOnboarding}
                  disabled={loading}
                  className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-[#C8A951] to-amber-400 hover:from-[#d8b95f] hover:to-amber-300 text-[#00205b] font-extrabold text-sm transition-all shadow-lg disabled:opacity-50"
                >
                  {loading ? '등록 진행 중...' : '🌱 프로필 등록 완료 & 학습 시작!'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

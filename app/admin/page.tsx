'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { getCurrentUser, fetchAdminStats, AdminStats, UserAccount } from '@/lib/auth'
import {
  fetchAdminQuestions,
  createAdminQuestion,
  updateAdminQuestion,
  deleteAdminQuestion,
  QuestionItem
} from '@/lib/questions'

export default function AdminDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserAccount | null>(null)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [questions, setQuestions] = useState<QuestionItem[]>([])
  const [activeTab, setActiveTab] = useState<'stats' | 'cms'>('stats')

  // CMS 문항 추가/수정 모달 상태
  const [showQuestionModal, setShowQuestionModal] = useState<boolean>(false)
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null)
  const [stem, setStem] = useState<string>('')
  const [conceptName, setConceptName] = useState<string>('세 자리 수의 덧셈')
  const [difficulty, setDifficulty] = useState<number>(1)
  const [choice1, setChoice1] = useState<string>('')
  const [choice2, setChoice2] = useState<string>('')
  const [choice3, setChoice3] = useState<string>('')
  const [choice4, setChoice4] = useState<string>('')
  const [correctIndex, setCorrectIndex] = useState<number>(0)
  const [explanation, setExplanation] = useState<string>('')

  const reloadData = async () => {
    const s = await fetchAdminStats()
    setStats(s)
    const qList = await fetchAdminQuestions()
    setQuestions(qList)
  }

  useEffect(() => {
    async function init() {
      const u = await getCurrentUser()
      if (!u) {
        router.push('/login')
        return
      }
      setUser(u)
      await reloadData()
    }
    init()
  }, [router])

  // 문항 추가 버튼 클릭
  const handleOpenAddModal = () => {
    setEditingQuestion(null)
    setStem('')
    setConceptName('세 자리 수의 덧셈')
    setDifficulty(1)
    setChoice1('')
    setChoice2('')
    setChoice3('')
    setChoice4('')
    setCorrectIndex(0)
    setExplanation('')
    setShowQuestionModal(true)
  }

  // 문항 수정 버튼 클릭
  const handleOpenEditModal = (q: QuestionItem) => {
    setEditingQuestion(q)
    setStem(q.body?.stem || '')
    setConceptName(q.concept_name || '')
    setDifficulty(q.difficulty || 1)
    const choices = q.body?.choices || ['', '', '', '']
    setChoice1(choices[0] || '')
    setChoice2(choices[1] || '')
    setChoice3(choices[2] || '')
    setChoice4(choices[3] || '')
    setCorrectIndex(q.answer?.correct_index || 0)
    setExplanation(q.answer?.explanation || '')
    setShowQuestionModal(true)
  }

  // 문항 삭제
  const handleDeleteQuestion = async (id: string) => {
    if (!window.confirm('정말로 이 문제 은행 문항을 삭제하시겠습니까?')) return
    await deleteAdminQuestion(id)
    await reloadData()
    alert('🗑️ 문항이 성공적으로 삭제되었습니다.')
  }

  // 문항 저장 핸들러
  const handleSaveQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stem.trim()) {
      alert('문제 지문(Stem)을 입력해 주세요!')
      return
    }

    const bodyObj = {
      stem: stem.trim(),
      choices: [choice1.trim(), choice2.trim(), choice3.trim(), choice4.trim()]
    }

    const answerObj = {
      correct_index: correctIndex,
      explanation: explanation.trim() || '차근차근 원리를 계산해 보세요.'
    }

    if (editingQuestion) {
      await updateAdminQuestion(editingQuestion.id, {
        concept_name: conceptName,
        difficulty,
        body: bodyObj,
        answer: answerObj
      })
      alert('✏️ 문제 문항이 성공적으로 수정되었습니다!')
    } else {
      await createAdminQuestion({
        concept_name: conceptName,
        difficulty,
        body: bodyObj,
        answer: answerObj
      })
      alert('🎉 새 문제 문항이 CMS에 성공적으로 추가되었습니다!')
    }

    setShowQuestionModal(false)
    await reloadData()
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans flex flex-col">
      <Navbar />

      <div className="flex-1 p-4 sm:p-8 max-w-6xl mx-auto w-full space-y-8">
        {/* 상단 관리자 타이틀 */}
        <header className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <h1 className="text-2xl font-black tracking-tight">꿈 자람 터 관리자 시스템 (CMS)</h1>
              <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-400 text-slate-950">
                Admin Console
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
              학습자 관심 직업 통계, 인기 메뉴 클릭 로그 및 3~6학년 문제 은행 CMS 관리 화면입니다.
            </p>
          </div>

          {/* 탭 스위처 */}
          <div className="flex bg-slate-800 p-1.5 rounded-2xl border border-slate-700">
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                activeTab === 'stats' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              📊 통계 & 랭킹 리포트
            </button>
            <button
              onClick={() => setActiveTab('cms')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                activeTab === 'cms' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              📚 문제 은행 CMS ({questions.length})
            </button>
          </div>
        </header>

        {/* 1. 통계 & 랭킹 리포트 탭 */}
        {activeTab === 'stats' && stats && (
          <main className="space-y-8 animate-fade-in">
            {/* 요약 카운트 뱃지 */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md">
                <span className="text-xs font-extrabold text-slate-500">총 사용자 계정 수</span>
                <div className="mt-2 text-3xl font-black text-slate-900">{stats.totalUsersCount} 명</div>
                <span className="text-xs text-emerald-600 font-bold mt-1 block">Supabase Auth 연동</span>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md">
                <span className="text-xs font-extrabold text-slate-500">등록된 자녀 프로필 수</span>
                <div className="mt-2 text-3xl font-black text-amber-600">{stats.totalChildrenCount} 명</div>
                <span className="text-xs text-amber-700 font-bold mt-1 block">실시간 DB 데이터</span>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md">
                <span className="text-xs font-extrabold text-slate-500">총 보유 문제 수</span>
                <div className="mt-2 text-3xl font-black text-indigo-600">{questions.length} 문항</div>
                <span className="text-xs text-indigo-600 font-bold mt-1 block">초등 3~6학년 시드</span>
              </div>
            </section>

            {/* 통계 카드 3종 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 희망 직업 순위 Top 5 */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-lg space-y-4">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span>🚀</span>
                  <span>학습자 희망 직업 Top 5</span>
                </h3>
                <div className="space-y-3">
                  {stats.topDreamJobs.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs font-bold bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <span className="text-slate-800">{idx + 1}. {item.job}</span>
                      <span className="bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full font-black">
                        {item.count}명 선택
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 인기 소원 선물 순위 */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-lg space-y-4">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span>🎁</span>
                  <span>인기 소원 선물 순위 Top 5</span>
                </h3>
                <div className="space-y-3">
                  {stats.topWishes.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs font-bold bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <span className="text-slate-800">{idx + 1}. {item.title}</span>
                      <span className="bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full font-black">
                        {item.count}건 등록
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 메뉴별 클릭수 랭킹 */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-lg space-y-4">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span>🖱️</span>
                  <span>메뉴별 일/주간 클릭수 랭킹</span>
                </h3>
                <div className="space-y-3">
                  {stats.menuClicks.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs font-bold bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <span className="text-slate-800">{idx + 1}. {item.menu}</span>
                      <span className="bg-indigo-100 text-indigo-900 px-2.5 py-0.5 rounded-full font-black">
                        {item.clicks} 회
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        )}

        {/* 2. 문제 은행 CMS CRUD 탭 */}
        {activeTab === 'cms' && (
          <main className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>📚</span>
                  <span>Supabase 문제 은행 CMS 문항 관리 ({questions.length}문항)</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  초등 3~6학년 대표 개념 문항 및 선택지, 정답 해설을 자유롭게 등록·수정·삭제할 수 있습니다.
                </p>
              </div>

              <button
                onClick={handleOpenAddModal}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs shadow-md hover:scale-105 transition-transform"
              >
                + 새 문제 등록하기
              </button>
            </div>

            {/* 문항 테이블 목록 */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-bold">
                  <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="p-4">ID</th>
                      <th className="p-4">단원/개념명</th>
                      <th className="p-4">난이도</th>
                      <th className="p-4">문제 지문 (Stem)</th>
                      <th className="p-4 text-center">관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {questions.map((q) => (
                      <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-slate-500 font-mono text-[11px]">{q.id}</td>
                        <td className="p-4">
                          <span className="bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full font-black text-[11px]">
                            {q.concept_name || '수학 문제'}
                          </span>
                        </td>
                        <td className="p-4 text-amber-600 font-black">⭐ 레벨 {q.difficulty || 1}</td>
                        <td className="p-4 max-w-md truncate text-slate-900">{q.body?.stem}</td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenEditModal(q)}
                              className="px-3 py-1 bg-slate-100 hover:bg-amber-100 text-amber-900 rounded-xl border border-amber-300 text-[11px]"
                            >
                              ✏️ 수정
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="px-3 py-1 bg-slate-100 hover:bg-rose-100 text-rose-700 rounded-xl border border-rose-200 text-[11px]"
                            >
                              🗑️ 삭제
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        )}
      </div>

      {/* CMS 문제 등록/수정 모달 */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-xl bg-white rounded-3xl border-2 border-amber-300 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>{editingQuestion ? '✏️' : '➕'}</span>
                <span>{editingQuestion ? 'CMS 문제 문항 수정' : '새 CMS 문제 문항 등록'}</span>
              </h3>
              <button
                onClick={() => setShowQuestionModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuestionSubmit} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 mb-1">단원/개념명</label>
                <input
                  type="text"
                  required
                  value={conceptName}
                  onChange={(e) => setConceptName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">난이도 (1 ~ 3 레벨)</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-bold"
                >
                  <option value={1}>레벨 1 (기초 개념)</option>
                  <option value={2}>레벨 2 (응용 풀이)</option>
                  <option value={3}>레벨 3 (심화 서술형)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">
                  문제 지문 (Stem) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="예: 345 + 234 의 계산 결과는 얼마일까요?"
                  value={stem}
                  onChange={(e) => setStem(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-slate-800 font-black">보기 4지선다 항목</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="보기 1"
                    value={choice1}
                    onChange={(e) => setChoice1(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                  />
                  <input
                    type="text"
                    placeholder="보기 2"
                    value={choice2}
                    onChange={(e) => setChoice2(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                  />
                  <input
                    type="text"
                    placeholder="보기 3"
                    value={choice3}
                    onChange={(e) => setChoice3(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                  />
                  <input
                    type="text"
                    placeholder="보기 4"
                    value={choice4}
                    onChange={(e) => setChoice4(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">정답 선택지 번호</label>
                <select
                  value={correctIndex}
                  onChange={(e) => setCorrectIndex(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-bold"
                >
                  <option value={0}>1번 항목 정답</option>
                  <option value={1}>2번 항목 정답</option>
                  <option value={2}>3번 항목 정답</option>
                  <option value={3}>4번 항목 정답</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">정답 해설</label>
                <textarea
                  rows={2}
                  placeholder="각 자리별 덧셈 원리를 더해줍니다."
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-bold"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs shadow-md hover:scale-105 transition-transform"
                >
                  💾 문항 저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

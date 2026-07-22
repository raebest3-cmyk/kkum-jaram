export default function ChildDashboardPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-10 font-sans">
      {/* 상단 프로필 및 현황 헤더 */}
      <header className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center pb-8 border-b border-slate-800 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-2xl text-white shadow-lg shadow-indigo-500/30">
            꿈
          </div>
          <div>
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-amber-200 via-indigo-200 to-purple-200 bg-clip-text text-transparent">
              꿈나무 학습자
            </h1>
            <p className="text-sm text-slate-400">초등학교 3학년 수학 탐험 중 ✨</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-slate-800/80 px-5 py-2.5 rounded-xl border border-slate-700/60 backdrop-blur-sm">
          <div className="text-right">
            <p className="text-xs text-slate-400">보유 포인트</p>
            <p className="text-lg font-extrabold text-amber-400">🪙 1,250 P</p>
          </div>
        </div>
      </header>

      {/* 대시보드 메인 콘텐츠 */}
      <main className="max-w-5xl mx-auto mt-8 space-y-10">
        {/* 오늘의 미션 카드 3종 */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              🎯 오늘의 미션 (3종)
            </h2>
            <span className="text-xs text-slate-400">학습 루프 10문항 집중 풀이</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 미션 1: 일반 (수학) */}
            <div className="group relative bg-slate-800/60 rounded-2xl p-6 border border-slate-700/50 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 font-bold text-lg">
                01
              </div>
              <h3 className="text-lg font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                일반 미션 (수학)
              </h3>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                복습 4문항 + 약점 개념 신규 6문항
              </p>
              <div className="flex justify-between items-center text-xs font-semibold text-indigo-400 pt-2 border-t border-slate-700/40">
                <span>10 문항</span>
                <span className="bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">도전 가능</span>
              </div>
            </div>

            {/* 미션 2: 심화 (오답 괴물 격파) */}
            <div className="group relative bg-slate-800/60 rounded-2xl p-6 border border-slate-700/50 hover:border-rose-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-rose-500/10">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4 font-bold text-lg">
                02
              </div>
              <h3 className="text-lg font-bold text-slate-100 group-hover:text-rose-300 transition-colors">
                오답 괴물 격파 (복습)
              </h3>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                간격반복(SRS) 주기 복습 문항
              </p>
              <div className="flex justify-between items-center text-xs font-semibold text-rose-400 pt-2 border-t border-slate-700/40">
                <span>괴물 3마리 출현</span>
                <span className="bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">준비됨</span>
              </div>
            </div>

            {/* 미션 3: 특별 (AI 탐구 수다) */}
            <div className="group relative bg-slate-800/60 rounded-2xl p-6 border border-slate-700/50 hover:border-amber-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 font-bold text-lg">
                03
              </div>
              <h3 className="text-lg font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                AI와 탐구 대화 (특별)
              </h3>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                개념 말로 설명하기 & 독서 토론
              </p>
              <div className="flex justify-between items-center text-xs font-semibold text-amber-400 pt-2 border-t border-slate-700/40">
                <span>대화 미션</span>
                <span className="bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">잠금 해제</span>
              </div>
            </div>
          </div>
        </section>

        {/* 나의 성장 & 소원 상자 퍼즐 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800/40 rounded-2xl p-6 border border-slate-800">
            <h3 className="text-base font-bold text-slate-200 mb-3 flex items-center gap-2">
              📈 나의 개념 숙달 그래프
            </h3>
            <div className="h-40 bg-slate-900/60 rounded-xl flex items-center justify-center border border-slate-800 text-slate-500 text-sm">
              개념 숙달도 추이 시각화 차트 영역
            </div>
          </div>

          <div className="bg-slate-800/40 rounded-2xl p-6 border border-slate-800">
            <h3 className="text-base font-bold text-slate-200 mb-3 flex items-center gap-2">
              🎁 소원상자 퍼즐 진행 현황
            </h3>
            <div className="h-40 bg-slate-900/60 rounded-xl p-4 flex flex-col justify-between border border-slate-800">
              <div>
                <p className="text-sm font-semibold text-amber-300">목표 소원: 레고 우주선 세트</p>
                <p className="text-xs text-slate-400 mt-1">목표 포인트 3,000 P 중 1,250 P 달성 (41.6%)</p>
              </div>
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-amber-300 h-full w-[41.6%]" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

'use client'

import React, { useState } from 'react'
import { getUserApiKey } from '@/lib/auth'

interface AiChatModalProps {
  childName: string
  dreamJob: string
  onClose: (earnedPoints: number) => void
}

interface ChatMessage {
  id: string
  sender: 'ai' | 'child'
  text: string
  timestamp: string
}

export default function AiChatModal({ childName, dreamJob, onClose }: AiChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: `안녕 ${childName} 요리사님! 👨‍🍳 오늘 탐구할 나눗셈 개념을 나만의 레시피처럼 설명해 볼까요? 어떤 생각을 했는지 편하게 말해줘요!`,
      timestamp: '방금 전'
    }
  ])

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  // 메시지 전송 및 AI 응답 처리
  const handleSendMessage = async () => {
    if (!input.trim() || loading) return

    const userText = input.trim()
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'child',
      text: userText,
      timestamp: '방금 전'
    }

    setMessages((prev) => [...prev, newMsg])
    setInput('')
    setLoading(true)

    // AI 응답 시뮬레이션 / BYOK 호출
    setTimeout(() => {
      let aiText = ''
      const key = getUserApiKey()

      if (userText.includes('나누기') || userText.includes('조각') || userText.includes('나눗셈')) {
        aiText = `와! ${childName} 요리사님이 똑같이 나누어 담는 원리를 정말 근사하게 설명했네요! 🍕 피자 한 판을 친구들과 나눌 때 나눗셈을 쓰는 이유를 잘 파악했어요! 칭찬해요 ⭐`
      } else if (userText.includes('분수') || userText.includes('조각')) {
        aiText = `맞아요! 전체를 똑같이 나눈 것 중 몇 조각인지 생각하는 분수의 개념을 훌륭하게 말해줬어요! 👏`
      } else {
        aiText = `좋은 생각이에요! ${childName} 요리사님의 눈높이 설명 덕분에 나눗셈이 훨씬 쉽게 이해되네요! 🌟 훌륭하게 미션을 수행했어요!`
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-ai-${Date.now()}`,
          sender: 'ai',
          text: aiText,
          timestamp: '방금 전'
        }
      ])
      setLoading(false)
      setIsCompleted(true)
    }, 1000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl bg-[#FDFBF7] rounded-3xl border-2 border-amber-300 shadow-2xl overflow-hidden flex flex-col h-[600px] max-h-[90vh]">
        {/* 파스텔 옐로우/오렌지 모달 헤더 */}
        <div className="bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 text-amber-950 px-6 py-4 flex justify-between items-center border-b border-amber-300 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-sm border border-amber-300">
              🤖
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-amber-950">
                AI 선생님과 말로 설명하기
              </h2>
              <p className="text-xs text-amber-800 font-extrabold">
                {childName} 요리사의 탐구 토론 세션 ✦
              </p>
            </div>
          </div>

          <button
            onClick={() => onClose(0)}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-sm text-amber-900 font-black shadow-sm transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 대화 메시지 영역 */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-[#FFFDF9]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                msg.sender === 'child' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center text-lg shadow-sm shrink-0 border ${
                  msg.sender === 'child'
                    ? 'bg-amber-200 text-amber-900 border-amber-300'
                    : 'bg-white text-emerald-700 border-amber-200'
                }`}
              >
                {msg.sender === 'child' ? '👧' : '🤖'}
              </div>

              <div
                className={`max-w-[78%] rounded-2xl p-4 text-sm font-bold shadow-sm leading-relaxed ${
                  msg.sender === 'child'
                    ? 'bg-[#003087] text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border-2 border-amber-200/80 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-50 px-4 py-2 rounded-full w-fit border border-amber-200 animate-pulse">
              <span>🤖 AI 선생님이 수빈이의 설명을 읽는 중...</span>
            </div>
          )}
        </div>

        {/* 예시 문장 프리셋 칩 */}
        <div className="px-5 py-2 bg-amber-50/60 border-t border-amber-200 flex gap-2 overflow-x-auto text-xs font-bold">
          <span className="text-amber-800 shrink-0 py-1">💡 추천 설명:</span>
          <button
            onClick={() => setInput('12개 사과를 4명에게 3개씩 똑같이 나누는 게 나눗셈이에요!')}
            className="bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full shrink-0 transition-colors"
          >
            "사과를 똑같이 나누는 것이 나눗셈이에요!"
          </button>
          <button
            onClick={() => setInput('피자 한 판을 8조각으로 나눈 하나가 1/8 분수예요!')}
            className="bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full shrink-0 transition-colors"
          >
            "피자 8조각 중 하나가 1/8 분수예요!"
          </button>
        </div>

        {/* 하단 입력 & 보상 수령 */}
        <div className="p-4 bg-white border-t border-amber-200 space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="AI 선생님에게 나눗셈 원리를 설명해 보세요..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 text-sm font-bold focus:outline-none focus:border-amber-400"
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !input.trim()}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-amber-950 font-black text-sm shadow-md transition-transform hover:scale-105 disabled:opacity-50"
            >
              전송 💬
            </button>
          </div>

          {isCompleted && (
            <div className="pt-2 flex justify-between items-center">
              <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                🎉 대화 미션 성공! 보상 +30 P 받기 준비완료
              </span>
              <button
                onClick={() => onClose(30)}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#0D8A68] to-emerald-500 text-white font-black text-xs shadow-md hover:scale-105 transition-transform"
              >
                🎁 +30 P 받고 미션 완료!
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

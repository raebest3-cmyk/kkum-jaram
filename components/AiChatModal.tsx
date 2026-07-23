'use client'

import React, { useState, useEffect } from 'react'
import { generateAiChatResponse } from '@/lib/gemini'

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
      text: `안녕 ${childName} 어린이! ✨ Gemini AI 선생님이에요! 마이크 버튼 🎙️을 누르고 음성으로 말하거나 텍스트로 나눗셈 개념을 자유롭게 이야기해 볼까요?`,
      timestamp: '방금 전'
    }
  ])

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  // STT (Web Speech API) 상태
  const [isListening, setIsListening] = useState(false)

  // STT 음성 인식 시작/중지
  const toggleSpeechRecognition = () => {
    if (typeof window === 'undefined') return

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert('사용 중이신 브라우저에서는 음성 인식(STT)을 지원하지 않습니다. 텍스트 입력창을 이용해 주세요!')
      return
    }

    if (isListening) {
      setIsListening(false)
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.lang = 'ko-KR'
      recognition.interimResults = true
      recognition.continuous = false

      recognition.onstart = () => {
        setIsListening(true)
      }

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('')

        setInput(transcript)
      }

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error)
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.start()
    } catch (e) {
      console.error(e)
      setIsListening(false)
    }
  }

  // 메시지 전송 및 Gemini 1.5 Flash AI 응답 처리
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
    setIsListening(false)

    try {
      // Gemini 1.5 Flash API 호출
      const aiReply = await generateAiChatResponse(userText, childName, dreamJob)

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-ai-${Date.now()}`,
          sender: 'ai',
          text: aiReply,
          timestamp: '방금 전'
        }
      ])
      setIsCompleted(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl bg-[#FDFBF7] rounded-3xl border-2 border-amber-300 shadow-2xl overflow-hidden flex flex-col h-[620px] max-h-[90vh]">
        {/* Gemini 1.5 Flash 대화 모달 헤더 */}
        <div className="bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 text-amber-950 px-6 py-4 flex justify-between items-center border-b border-amber-300 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-sm border border-amber-300">
              ✨
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-amber-950 flex items-center gap-2">
                <span>Gemini AI 말로 설명하기</span>
                <span className="text-[10px] font-black bg-[#003087] text-white px-2 py-0.5 rounded-full">
                  Gemini 1.5 Flash ⚡
                </span>
              </h2>
              <p className="text-xs text-amber-800 font-extrabold">
                {childName} 어린이의 음성 탐구 세션 ✦
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
                {msg.sender === 'child' ? '👧' : '✨'}
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
              <span>✨ Gemini 1.5 Flash가 생각하는 중...</span>
            </div>
          )}

          {isListening && (
            <div className="flex items-center gap-2 text-xs font-black text-rose-700 bg-rose-50 px-4 py-2.5 rounded-2xl border-2 border-rose-300 animate-bounce">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span>🎙️ 수빈이의 목소리를 실시간 듣고 있어요! 말해 주세요...</span>
            </div>
          )}
        </div>

        {/* 예시 문장 프리셋 칩 */}
        <div className="px-5 py-2 bg-amber-50/60 border-t border-amber-200 flex gap-2 overflow-x-auto text-xs font-bold">
          <span className="text-amber-800 shrink-0 py-1">💡 추천 문장:</span>
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

        {/* 하단 STT 음성 마이크 버튼 & 텍스트 입력창 */}
        <div className="p-4 bg-white border-t border-amber-200 space-y-3">
          <div className="flex items-center gap-2">
            {/* STT 음성 인식 마이크 버튼 */}
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              title="음성으로 말하기 (STT)"
              className={`p-3.5 rounded-2xl border-2 font-black text-base shadow-sm transition-all flex items-center justify-center shrink-0 ${
                isListening
                  ? 'bg-rose-500 text-white border-rose-600 ring-4 ring-rose-200 scale-105 animate-pulse'
                  : 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
              }`}
            >
              <span>🎙️</span>
            </button>

            <input
              type="text"
              placeholder={isListening ? '듣고 있는 중입니다...' : '음성으로 말하거나 텍스트로 입력하세요...'}
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

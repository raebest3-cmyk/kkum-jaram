'use client'

import React, { useRef, useState, useEffect } from 'react'

export default function ScratchCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState('#1E293B') // 기본 다크 슬레이트 펜
  const [lineWidth, setLineWidth] = useState(3)
  const [isEraser, setIsEraser] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 캔버스 크기 모듈 부모에 맞춤
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height

      // 은은한 그리드 노트 라인 그리기
      ctx.strokeStyle = '#F1F5F9'
      ctx.lineWidth = 1
      for (let y = 20; y < canvas.height; y += 24) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    ctx.beginPath()
    ctx.moveTo(clientX - rect.left, clientY - rect.top)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = isEraser ? '#FDFBF7' : color
    ctx.lineWidth = isEraser ? lineWidth * 4 : lineWidth

    ctx.lineTo(clientX - rect.left, clientY - rect.top)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const handleClear = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 그리드 라인 다시 그리기
    ctx.strokeStyle = '#F1F5F9'
    ctx.lineWidth = 1
    for (let y = 20; y < canvas.height; y += 24) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }
  }

  return (
    <div className="bg-[#FFFDF9] rounded-2xl border-2 border-amber-200/80 p-3 shadow-inner relative space-y-2 animate-fade-in">
      {/* 연습장 툴바 */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-amber-50/80 p-2 rounded-xl border border-amber-200 text-xs font-bold">
        <div className="flex items-center gap-2">
          <span className="text-amber-800 font-black flex items-center gap-1">
            <span>✏️</span>
            <span>풀이 연습장</span>
          </span>

          {/* 색상 선택 */}
          <div className="flex items-center gap-1.5 ml-2 border-l border-amber-200 pl-2">
            {[
              { color: '#1E293B', label: '검정' },
              { color: '#2563EB', label: '파랑' },
              { color: '#E11D48', label: '빨강' },
              { color: '#0D8A68', label: '초록' }
            ].map((item) => (
              <button
                key={item.color}
                onClick={() => {
                  setColor(item.color)
                  setIsEraser(false)
                }}
                className={`w-5 h-5 rounded-full border border-white shadow-sm transition-transform ${
                  !isEraser && color === item.color ? 'scale-125 ring-2 ring-amber-400' : ''
                }`}
                style={{ backgroundColor: item.color }}
                title={item.label}
              />
            ))}
          </div>

          {/* 지우개 모드 */}
          <button
            onClick={() => setIsEraser(!isEraser)}
            className={`px-2.5 py-1 rounded-lg transition-colors font-extrabold ${
              isEraser ? 'bg-amber-300 text-amber-950 shadow-sm' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            🧹 지우개
          </button>
        </div>

        {/* 전체 지우기 */}
        <button
          onClick={handleClear}
          className="px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 font-extrabold border border-rose-200 transition-colors"
        >
          전체 지우기 🗑️
        </button>
      </div>

      {/* 캔버스 드로잉 영역 */}
      <div className="relative w-full h-44 rounded-xl overflow-hidden bg-[#FDFBF7] cursor-crosshair touch-none border border-slate-200">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full block"
        />
        <div className="absolute top-2 right-2 text-[10px] text-slate-400 font-bold pointer-events-none select-none">
          마우스나 펜으로 자유롭게 필기하세요
        </div>
      </div>
    </div>
  )
}

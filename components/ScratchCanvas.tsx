'use client'

import React, { useRef, useState, useEffect } from 'react'

export default function ScratchCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null)

  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState('#1E293B') // 기본 다크 펜
  const [lineWidth, setLineWidth] = useState(3)
  const [isEraser, setIsEraser] = useState(false)

  // 오프스크린 캔버스 초기화 및 필기 획 유지 렌더링
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // 오프스크린 백업 캔버스 생성
    if (!offscreenCanvasRef.current) {
      const offCanvas = document.createElement('canvas')
      offscreenCanvasRef.current = offCanvas
    }

    const offCanvas = offscreenCanvasRef.current
    const rect = canvas.parentElement?.getBoundingClientRect()
    const width = rect?.width || 600
    const height = 180

    canvas.width = width
    canvas.height = height

    if (offCanvas.width === 0 || offCanvas.height === 0) {
      offCanvas.width = width
      offCanvas.height = height
    }

    // 캔버스 초기 복원 렌더링
    redrawCanvas()
  }, [])

  // 캔버스 및 그리드 + 백업 획 갱신 렌더링
  const redrawCanvas = () => {
    const canvas = canvasRef.current
    const offCanvas = offscreenCanvasRef.current
    if (!canvas || !offCanvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 1. 노트 그리드 배경선 그리기
    ctx.strokeStyle = '#F1F5F9'
    ctx.lineWidth = 1
    for (let y = 24; y < canvas.height; y += 24) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // 2. 백업된 오프스크린 필기 획 복원
    ctx.drawImage(offCanvas, 0, 0)
  }

  // 드로잉 시작
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    const offCanvas = offscreenCanvasRef.current
    if (!canvas || !offCanvas) return

    const offCtx = offCanvas.getContext('2d')
    if (!offCtx) return

    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    const x = clientX - rect.left
    const y = clientY - rect.top

    offCtx.beginPath()
    offCtx.moveTo(x, y)
  }

  // 드로잉 중 (펜 또는 지우개)
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    const offCanvas = offscreenCanvasRef.current
    if (!canvas || !offCanvas) return

    const offCtx = offCanvas.getContext('2d')
    if (!offCtx) return

    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    const x = clientX - rect.left
    const y = clientY - rect.top

    offCtx.lineCap = 'round'
    offCtx.lineJoin = 'round'

    if (isEraser) {
      // 🧹 지우개 모드: destination-out 알파 마스킹으로 획 부분 지우기
      offCtx.globalCompositeOperation = 'destination-out'
      offCtx.lineWidth = lineWidth * 6
    } else {
      // ✏️ 펜 모드: 일반 획 그리기
      offCtx.globalCompositeOperation = 'source-over'
      offCtx.strokeStyle = color
      offCtx.lineWidth = lineWidth
    }

    offCtx.lineTo(x, y)
    offCtx.stroke()

    // 메인 캔버스 복원 렌더링 (손을 떼도 지속 보존)
    redrawCanvas()
  }

  // 드로잉 종료 (획 영구 보존)
  const stopDrawing = () => {
    if (!isDrawing) return
    setIsDrawing(false)
    const offCanvas = offscreenCanvasRef.current
    if (offCanvas) {
      const offCtx = offCanvas.getContext('2d')
      if (offCtx) {
        offCtx.closePath()
      }
    }
    redrawCanvas()
  }

  // 전체 지우기 버튼 클릭 시에만 리셋
  const handleClearAll = () => {
    const canvas = canvasRef.current
    const offCanvas = offscreenCanvasRef.current
    if (!canvas || !offCanvas) return

    const offCtx = offCanvas.getContext('2d')
    if (offCtx) {
      offCtx.clearRect(0, 0, offCanvas.width, offCanvas.height)
    }

    redrawCanvas()
  }

  return (
    <div className="bg-[#FFFDF9] rounded-2xl border-2 border-amber-200/80 p-3 shadow-inner relative space-y-2 animate-fade-in">
      {/* 연습장 툴바 */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-amber-50/90 p-2 rounded-xl border border-amber-200 text-xs font-bold">
        <div className="flex items-center gap-2">
          <span className="text-amber-900 font-black flex items-center gap-1">
            <span>✏️</span>
            <span>풀이 연습장</span>
          </span>

          {/* 펜/지우개 모드 전환 버튼 */}
          <div className="flex items-center gap-1 border-l border-amber-200 pl-2">
            <button
              onClick={() => setIsEraser(false)}
              className={`px-3 py-1 rounded-lg font-black transition-all flex items-center gap-1 ${
                !isEraser
                  ? 'bg-amber-400 text-amber-950 shadow-sm scale-105'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-amber-100'
              }`}
            >
              <span>🎨 펜 모드</span>
            </button>

            <button
              onClick={() => setIsEraser(true)}
              className={`px-3 py-1 rounded-lg font-black transition-all flex items-center gap-1 ${
                isEraser
                  ? 'bg-rose-400 text-rose-950 shadow-sm scale-105'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-rose-50'
              }`}
            >
              <span>🧹 부분 지우개</span>
            </button>
          </div>

          {/* 펜 색상 픽커 (!isEraser일 때 활성화) */}
          {!isEraser && (
            <div className="flex items-center gap-1.5 border-l border-amber-200 pl-2">
              {[
                { color: '#1E293B', label: '검정' },
                { color: '#2563EB', label: '파랑' },
                { color: '#E11D48', label: '빨강' },
                { color: '#0D8A68', label: '초록' }
              ].map((item) => (
                <button
                  key={item.color}
                  onClick={() => setColor(item.color)}
                  className={`w-5 h-5 rounded-full border border-white shadow-sm transition-transform ${
                    color === item.color ? 'scale-125 ring-2 ring-amber-400' : ''
                  }`}
                  style={{ backgroundColor: item.color }}
                  title={item.label}
                />
              ))}
            </div>
          )}
        </div>

        {/* 전체 지우기 버튼 */}
        <button
          onClick={handleClearAll}
          className="px-3 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-900 font-black border border-rose-300 transition-all active:scale-95 flex items-center gap-1"
        >
          <span>🗑️</span>
          <span>전체 지우기</span>
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
          {isEraser ? '🧹 부분 지우개 작동 중' : '🎨 필기 획이 지워지지 않고 보존됩니다'}
        </div>
      </div>
    </div>
  )
}

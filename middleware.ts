import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 공개 경로 (인증 없이 접근 가능한 라우트 목록)
const publicRoutes = ['/', '/login', '/admin/login', '/onboarding', '/child', '/parent', '/admin']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 정적 리소스, API 및 publicRoutes에 포함되는 경우 다음으로 진행
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    publicRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))
  ) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

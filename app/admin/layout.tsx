import React from 'react'
import AdminHeader from '@/components/AdminHeader'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      <AdminHeader />
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}

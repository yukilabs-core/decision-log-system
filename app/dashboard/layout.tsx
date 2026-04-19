'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, isLoading, router])

  const handleLogout = async () => {
    await logout()
    router.push('/auth/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* サイドバー */}
      <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col bg-indigo-900 text-white">
        <div className="flex items-center justify-center h-16 border-b border-indigo-800">
          <h1 className="text-xl font-bold">Decision Log</h1>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          <Link
            href="/dashboard"
            className="block px-4 py-2 rounded-lg hover:bg-indigo-800 transition"
          >
            📋 一覧
          </Link>
          <Link
            href="/dashboard/new"
            className="block px-4 py-2 rounded-lg hover:bg-indigo-800 transition"
          >
            ➕ 新規作成
          </Link>
        </nav>

        <div className="border-t border-indigo-800 p-4">
          <p className="text-sm text-indigo-200 mb-3">{user.email}</p>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-indigo-800 rounded-lg hover:bg-indigo-700 transition text-sm"
          >
            ログアウト
          </button>
        </div>
      </aside>

      {/* メインコンテンツ */}
      <main className="md:ml-64">
        {/* モバイル用ヘッダー */}
        <div className="md:hidden bg-indigo-900 text-white p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Decision Log</h1>
            <button
              onClick={handleLogout}
              className="text-sm bg-indigo-800 px-3 py-1 rounded hover:bg-indigo-700"
            >
              ログアウト
            </button>
          </div>
        </div>

        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  )
}

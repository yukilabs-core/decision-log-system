'use client'

import { useState } from 'react'
import Link from 'next/link'
import DecisionLogList from '@/components/DecisionLogList'
import SearchBar from '@/components/SearchBar'
import { DecisionStatus, DecisionType } from '@/types'

export default function DashboardPage() {
  const [filter, setFilter] = useState<{
    search?: string
    status?: DecisionStatus
    type?: DecisionType
    tags?: string[]
  }>({})

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">判断ログ</h2>
          <p className="text-gray-600 text-sm mt-1">意思決定を記録・管理</p>
        </div>
        <Link
          href="/dashboard/new"
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
        >
          ➕ 新規作成
        </Link>
      </div>

      <SearchBar onFilter={setFilter} />

      <DecisionLogList filter={filter} />
    </div>
  )
}

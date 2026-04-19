'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useDecisionLogs } from '@/hooks/useDecisionLogs'
import { DecisionLog, DecisionStatus, DecisionType } from '@/types'

interface DecisionLogListProps {
  filter?: {
    status?: DecisionStatus
    type?: DecisionType
    tags?: string[]
    search?: string
  }
}

const STATUS_DISPLAY = {
  pending: { icon: '⏳', label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  success: { icon: '✓', label: 'Success', color: 'bg-green-100 text-green-700' },
  failed: { icon: '✗', label: 'Failed', color: 'bg-red-100 text-red-700' },
  hold: { icon: '⏸', label: 'Hold', color: 'bg-gray-100 text-gray-700' },
}

const TYPE_DISPLAY = {
  strategy: 'Strategy',
  implementation: 'Impl',
  operation: 'Ops',
  emergency: 'Emg',
}

export default function DecisionLogList({ filter }: DecisionLogListProps) {
  const { user, isLoading: authLoading } = useAuth()
  const { getLogs, isLoading } = useDecisionLogs()
  const [logs, setLogs] = useState<DecisionLog[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loadingTimeout, setLoadingTimeout] = useState(false)
  const itemsPerPage = 20
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    console.log('[DecisionLogList] Component mounted')
    return () => {
      console.log('[DecisionLogList] Component unmounted')
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    console.log('[DecisionLogList] State changed - Auth loading:', authLoading, 'User:', user?.email, 'Page:', page, 'API loading:', isLoading)
  }, [user, authLoading, page, isLoading])

  useEffect(() => {
    const fetchLogs = async () => {
      const timestamp = new Date().toISOString()
      console.log(`[${timestamp}] [DecisionLogList] Effect triggered - User: ${user?.email || 'null'}, Auth loading: ${authLoading}`)

      if (authLoading) {
        console.log(`[${timestamp}] [DecisionLogList] Auth still loading, skipping fetch`)
        return
      }

      if (!user) {
        console.log(`[${timestamp}] [DecisionLogList] No user after auth load, skipping fetch`)
        return
      }

      console.log(`[${timestamp}] [DecisionLogList] Starting fetch for page ${page}`)
      setLoadingTimeout(false)

      // Safety timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        if (mountedRef.current) {
          console.warn(`[${timestamp}] [DecisionLogList] Fetch timeout after 5s, forcing loading state off`)
          setLoadingTimeout(true)
        }
      }, 5000)

      try {
        const { logs: data, total: count } = await getLogs(user.id, {
          status: filter?.status,
          type: filter?.type,
          tags: filter?.tags,
          search: filter?.search,
          limit: itemsPerPage,
          offset: (page - 1) * itemsPerPage,
        })

        if (mountedRef.current) {
          console.log(`[${timestamp}] [DecisionLogList] Fetch completed - Got ${data.length} items, Total: ${count}`)
          setLogs(data)
          setTotal(count)
          setLoadingTimeout(false)
        }
      } catch (err) {
        console.error(`[${timestamp}] [DecisionLogList] Fetch failed:`, err)
        if (mountedRef.current) {
          setLoadingTimeout(true)
        }
      } finally {
        clearTimeout(timeoutId)
      }
    }

    fetchLogs()
  }, [user, authLoading, filter, page])

  if (isLoading && !loadingTimeout) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (loadingTimeout && !logs.length) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-red-600 mb-4">読み込みがタイムアウトしました</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          ページを再読み込み
        </button>
      </div>
    )
  }

  if (!logs.length) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-600">判断ログがまだありません</p>
        <Link
          href="/dashboard/new"
          className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          最初の判断ログを作成
        </Link>
      </div>
    )
  }

  const totalPages = Math.ceil(total / itemsPerPage)

  return (
    <div className="space-y-4">
      {/* テーブル */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                Title
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase w-20">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase w-32">
                Tags
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase w-28">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase w-20">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {logs.map((log) => {
              const status = STATUS_DISPLAY[log.status as DecisionStatus]
              const typeLabel = log.type ? TYPE_DISPLAY[log.type as keyof typeof TYPE_DISPLAY] : '-'
              const date = new Date(log.created_at).toLocaleDateString('ja-JP')

              return (
                <tr
                  key={log.id}
                  className="hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => (window.location.href = `/dashboard/${log.id}`)}
                >
                  <td className="px-6 py-4">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 truncate">{log.title}</div>
                      <div className="text-sm text-gray-500 truncate mt-1">
                        {log.content.substring(0, 60)}...
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">{typeLabel}</td>
                  <td className="px-4 py-4">
                    <div className="flex gap-1 flex-wrap">
                      {log.tags?.slice(0, 2).map((tag, i) => (
                        <span
                          key={i}
                          className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {log.tags && log.tags.length > 2 && (
                        <span className="inline-block text-gray-500 text-xs px-2 py-1">
                          +{log.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">{date}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded ${status.color}`}>
                      {status.icon} {status.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 bg-white rounded-lg">
          <p className="text-sm text-gray-600">
            全 {total} 件中 {(page - 1) * itemsPerPage + 1}-
            {Math.min(page * itemsPerPage, total)} 件を表示
          </p>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(Math.max(1, page - 1))}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              ← 前へ
            </button>
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= page - 1 && pageNum <= page + 1)
              ) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-1 rounded ${
                      page === pageNum
                        ? 'bg-indigo-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              }
              if (pageNum === page - 2 || pageNum === page + 2) {
                return (
                  <span key={pageNum} className="px-3 py-1">
                    ...
                  </span>
                )
              }
              return null
            })}
            <button
              disabled={page === totalPages}
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              次へ →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

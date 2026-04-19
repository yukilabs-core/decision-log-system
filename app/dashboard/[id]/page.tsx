'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useDecisionLogs } from '@/hooks/useDecisionLogs'
import { DecisionLog } from '@/types'
import ReviewForm from '@/components/ReviewForm'

const STATUS_DISPLAY = {
  pending: { icon: '⏳', label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  success: { icon: '✓', label: 'Success', color: 'bg-green-100 text-green-700' },
  failed: { icon: '✗', label: 'Failed', color: 'bg-red-100 text-red-700' },
  hold: { icon: '⏸', label: 'Hold', color: 'bg-gray-100 text-gray-700' },
}

const TYPE_DISPLAY = {
  strategy: '戦略',
  implementation: '実装',
  operation: '運用',
  emergency: '緊急',
}

export default function DetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise)
  const router = useRouter()
  const { getLog, deleteLog, isLoading } = useDecisionLogs()
  const [log, setLog] = useState<DecisionLog | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchLog = async () => {
      const data = await getLog(params.id)
      if (data) {
        setLog(data)
      } else {
        router.push('/dashboard')
      }
    }

    fetchLog()
  }, [params.id])

  const handleDelete = async () => {
    if (!window.confirm('このログを削除しますか？')) return

    setIsDeleting(true)
    const success = await deleteLog(params.id)
    setIsDeleting(false)

    if (success) {
      router.push('/dashboard')
    } else {
      alert('削除に失敗しました')
    }
  }

  const handleRefreshAfterReview = async () => {
    const data = await getLog(params.id)
    if (data) {
      setLog(data)
    }
  }

  if (isLoading || !log) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  const status = STATUS_DISPLAY[log.status as keyof typeof STATUS_DISPLAY]
  const typeLabel = log.type ? TYPE_DISPLAY[log.type as keyof typeof TYPE_DISPLAY] : '-'
  const date = new Date(log.created_at).toLocaleDateString('ja-JP')

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{log.title}</h1>
          <div className="flex items-center gap-3 mt-3">
            <span className={`inline-flex items-center gap-1 text-sm font-medium px-3 py-1 rounded ${status.color}`}>
              {status.icon} {status.label}
            </span>
            {log.type && (
              <span className="inline-block bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded">
                {typeLabel}
              </span>
            )}
            <span className="text-sm text-gray-500">{date}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/${log.id}/edit`}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            編集
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting ? '削除中...' : '削除'}
          </button>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 左カラム */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-sm font-medium text-gray-600 uppercase tracking-wider mb-3">
              判断内容
            </h2>
            <p className="text-gray-900 whitespace-pre-wrap">{log.content}</p>
          </div>
        </div>

        {/* 右カラム */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-sm font-medium text-gray-600 uppercase tracking-wider mb-3">
              背景・状況
            </h2>
            <p className="text-gray-900 whitespace-pre-wrap">{log.background}</p>
          </div>
        </div>
      </div>

      {/* 判断理由（フル幅） */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-sm font-medium text-gray-600 uppercase tracking-wider mb-3">
          判断理由
        </h2>
        <p className="text-gray-900 whitespace-pre-wrap">{log.reason}</p>
      </div>

      {/* 選択肢 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-sm font-medium text-gray-600 uppercase tracking-wider mb-4">
          検討した選択肢
        </h2>
        <div className="space-y-3">
          {log.choices.map((choice) => (
            <div
              key={choice.id}
              className={`p-4 border-2 rounded-lg ${
                choice.id === log.selected_choice_id
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    {choice.id === log.selected_choice_id && '✓ '}
                    {choice.label}
                  </h3>
                  {choice.id === log.selected_choice_id && (
                    <p className="text-sm text-green-600 mt-1">選択済み</p>
                  )}
                </div>
              </div>
              {((choice.pros?.length ?? 0) > 0 || (choice.cons?.length ?? 0) > 0) && (
                <div className="mt-3 space-y-2 text-sm">
                  {(choice.pros?.length ?? 0) > 0 && (
                    <div>
                      <p className="text-gray-600 font-medium">メリット：</p>
                      <ul className="list-disc list-inside text-gray-700">
                        {choice.pros?.map((pro, i) => (
                          <li key={i}>{pro}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {(choice.cons?.length ?? 0) > 0 && (
                    <div>
                      <p className="text-gray-600 font-medium">デメリット：</p>
                      <ul className="list-disc list-inside text-gray-700">
                        {choice.cons?.map((con, i) => (
                          <li key={i}>{con}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* メタ情報 */}
      {((log.tags?.length ?? 0) > 0 || (log.constraints?.length ?? 0) > 0 || (log.risks?.length ?? 0) > 0 || (log.assumptions?.length ?? 0) > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(log.tags?.length ?? 0) > 0 && (
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-xs font-medium text-gray-600 uppercase mb-2">タグ</h3>
              <div className="flex flex-wrap gap-1">
                {log.tags?.map((tag, i) => (
                  <span key={i} className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          {(log.constraints?.length ?? 0) > 0 && (
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-xs font-medium text-gray-600 uppercase mb-2">制約条件</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                {log.constraints?.map((c, i) => (
                  <li key={i}>• {c}</li>
                ))}
              </ul>
            </div>
          )}
          {(log.risks?.length ?? 0) > 0 && (
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-xs font-medium text-gray-600 uppercase mb-2">リスク</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                {log.risks?.map((r, i) => (
                  <li key={i}>• {r}</li>
                ))}
              </ul>
            </div>
          )}
          {(log.assumptions?.length ?? 0) > 0 && (
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-xs font-medium text-gray-600 uppercase mb-2">前提条件</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                {log.assumptions?.map((a, i) => (
                  <li key={i}>• {a}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 振り返り */}
      <ReviewForm log={log} onSuccess={handleRefreshAfterReview} />

      {/* 既存の振り返り内容表示 */}
      {log.outcome && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm font-medium text-gray-600 uppercase tracking-wider mb-3">
            実行結果
          </h2>
          <p className="text-gray-900 whitespace-pre-wrap">{log.outcome}</p>
        </div>
      )}

      {(log.learning?.length ?? 0) > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm font-medium text-gray-600 uppercase tracking-wider mb-3">
            学び
          </h2>
          <ul className="list-disc list-inside space-y-2">
            {log.learning?.map((item, i) => (
              <li key={i} className="text-gray-900">{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 戻るボタン */}
      <div className="flex gap-2">
        <button
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          ← 戻る
        </button>
      </div>
    </div>
  )
}

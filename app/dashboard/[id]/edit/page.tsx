'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDecisionLogs } from '@/hooks/useDecisionLogs'
import DecisionLogForm from '@/components/DecisionLogForm'
import { DecisionLog } from '@/types'

export default function EditPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise)
  const router = useRouter()
  const { getLog, isLoading } = useDecisionLogs()
  const [log, setLog] = useState<DecisionLog | null>(null)

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
  }, [params.id, getLog, router])

  if (isLoading || !log) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">判断ログを編集</h1>
        <p className="text-gray-600 text-sm mt-1">{log.title}</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 mb-4">
          編集機能は現在実装中です。削除して新規作成することで更新できます。
        </p>
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

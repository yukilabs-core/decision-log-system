'use client'

import { useState } from 'react'
import { useDecisionLogs } from '@/hooks/useDecisionLogs'
import { DecisionLog } from '@/types'

interface ReviewFormProps {
  log: DecisionLog
  onSuccess?: () => void
}

export default function ReviewForm({ log, onSuccess }: ReviewFormProps) {
  const { updateLog, isLoading, error } = useDecisionLogs()

  const [status, setStatus] = useState(log.status)
  const [outcome, setOutcome] = useState(log.outcome || '')
  const [learning, setLearning] = useState<string[]>(log.learning || [])
  const [learningInput, setLearningInput] = useState('')
  const [nextActions, setNextActions] = useState<string[]>(log.next_actions || [])
  const [actionInput, setActionInput] = useState('')
  const [message, setMessage] = useState('')

  const addLearning = () => {
    if (learningInput.trim()) {
      setLearning([...learning, learningInput.trim()])
      setLearningInput('')
    }
  }

  const removeLearning = (index: number) => {
    setLearning(learning.filter((_, i) => i !== index))
  }

  const addAction = () => {
    if (actionInput.trim()) {
      setNextActions([...nextActions, actionInput.trim()])
      setActionInput('')
    }
  }

  const removeAction = (index: number) => {
    setNextActions(nextActions.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    const result = await updateLog(log.id, {
      status: status as any,
      outcome: outcome || null,
      learning: learning.length > 0 ? learning : null,
      next_actions: nextActions.length > 0 ? nextActions : null,
      reviewed_at: new Date().toISOString(),
    })

    if (result) {
      setMessage('✅ 振り返りを保存しました')
      setTimeout(() => {
        onSuccess?.()
      }, 1000)
    } else {
      setMessage(`❌ エラーが発生しました: ${error}`)
    }
  }

  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
      <h3 className="text-lg font-bold text-gray-900 mb-4">振り返り</h3>

      {message && (
        <div className={`mb-4 p-3 rounded text-sm ${
          message.startsWith('✅')
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 状態 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            実行状況
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="pending">Pending（未実行）</option>
            <option value="success">Success（成功）</option>
            <option value="failed">Failed（失敗）</option>
            <option value="hold">Hold（保留中）</option>
          </select>
        </div>

        {/* 実行結果 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            実行結果
          </label>
          <textarea
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="実行の結果を記述"
          />
        </div>

        {/* 学び */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            学び・気づき
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={learningInput}
              onChange={(e) => setLearningInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLearning())}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="学びを入力"
            />
            <button
              type="button"
              onClick={addLearning}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              追加
            </button>
          </div>
          <div className="space-y-2">
            {learning.map((item, i) => (
              <div key={i} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                <span className="text-sm">{item}</span>
                <button
                  type="button"
                  onClick={() => removeLearning(i)}
                  className="text-red-600 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 次のアクション */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            次のアクション
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={actionInput}
              onChange={(e) => setActionInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAction())}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="次のアクションを入力"
            />
            <button
              type="button"
              onClick={addAction}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              追加
            </button>
          </div>
          <div className="space-y-2">
            {nextActions.map((item, i) => (
              <div key={i} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                <span className="text-sm">{item}</span>
                <button
                  type="button"
                  onClick={() => removeAction(i)}
                  className="text-red-600 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? '保存中...' : '振り返りを保存'}
        </button>
      </form>
    </div>
  )
}

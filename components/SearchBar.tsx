'use client'

import { useState } from 'react'
import { DecisionStatus, DecisionType } from '@/types'

interface SearchBarProps {
  onFilter: (filter: {
    search?: string
    status?: DecisionStatus
    type?: DecisionType
    tags?: string[]
  }) => void
}

export default function SearchBar({ onFilter }: SearchBarProps) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<DecisionStatus | ''>('')
  const [type, setType] = useState<DecisionType | ''>('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  const handleSearch = () => {
    onFilter({
      search: search || undefined,
      status: (status as DecisionStatus) || undefined,
      type: (type as DecisionType) || undefined,
      tags: tags.length > 0 ? tags : undefined,
    })
  }

  const handleReset = () => {
    setSearch('')
    setStatus('')
    setType('')
    setTags([])
    onFilter({})
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index))
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* 検索 */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="キーワードで検索..."
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 col-span-1 md:col-span-2"
        />

        {/* ステータスフィルタ */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as DecisionStatus)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">全ての状態</option>
          <option value="pending">Pending</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="hold">Hold</option>
        </select>

        {/* タイプフィルタ */}
        <select
          value={type}
          onChange={(e) => setType(e.target.value as DecisionType)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">全てのタイプ</option>
          <option value="strategy">戦略</option>
          <option value="implementation">実装</option>
          <option value="operation">運用</option>
          <option value="emergency">緊急</option>
        </select>
      </div>

      {/* タグフィルタ */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            placeholder="タグを入力"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={addTag}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            追加
          </button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full flex items-center gap-2 text-sm"
              >
                {tag}
                <button
                  onClick={() => removeTag(i)}
                  className="hover:text-indigo-900"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ボタン */}
      <div className="flex gap-2 justify-end">
        <button
          onClick={handleReset}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          リセット
        </button>
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          検索
        </button>
      </div>
    </div>
  )
}

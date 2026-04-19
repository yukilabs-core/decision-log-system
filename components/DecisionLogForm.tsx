'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useDecisionLogs } from '@/hooks/useDecisionLogs'
import { Choice, DecisionType } from '@/types'

interface DecisionLogFormProps {
  onSuccess?: () => void
}

export default function DecisionLogForm({ onSuccess }: DecisionLogFormProps) {
  const { user } = useAuth()
  const { createLog, isLoading, error } = useDecisionLogs()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [background, setBackground] = useState('')
  const [reason, setReason] = useState('')
  const [type, setType] = useState<DecisionType>('strategy')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [choices, setChoices] = useState<Choice[]>([
    { id: '1', label: '', pros: [], cons: [] },
  ])
  const [selectedChoiceId, setSelectedChoiceId] = useState('1')

  const [constraints, setConstraints] = useState<string[]>([])
  const [constraintInput, setConstraintInput] = useState('')
  const [risks, setRisks] = useState<string[]>([])
  const [riskInput, setRiskInput] = useState('')
  const [assumptions, setAssumptions] = useState<string[]>([])
  const [assumptionInput, setAssumptionInput] = useState('')

  const [message, setMessage] = useState('')

  const addTag = () => {
    if (tagInput.trim()) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index))
  }

  const addChoice = () => {
    const newId = String(Math.max(...choices.map(c => parseInt(c.id)), 0) + 1)
    setChoices([...choices, { id: newId, label: '', pros: [], cons: [] }])
  }

  const updateChoice = (id: string, field: string, value: any) => {
    setChoices(
      choices.map(c =>
        c.id === id ? { ...c, [field]: value } : c
      )
    )
  }

  const removeChoice = (id: string) => {
    if (choices.length > 1) {
      setChoices(choices.filter(c => c.id !== id))
      if (selectedChoiceId === id) {
        setSelectedChoiceId(choices[0].id)
      }
    }
  }

  const addConstraint = () => {
    if (constraintInput.trim()) {
      setConstraints([...constraints, constraintInput.trim()])
      setConstraintInput('')
    }
  }

  const removeConstraint = (index: number) => {
    setConstraints(constraints.filter((_, i) => i !== index))
  }

  const addRisk = () => {
    if (riskInput.trim()) {
      setRisks([...risks, riskInput.trim()])
      setRiskInput('')
    }
  }

  const removeRisk = (index: number) => {
    setRisks(risks.filter((_, i) => i !== index))
  }

  const addAssumption = () => {
    if (assumptionInput.trim()) {
      setAssumptions([...assumptions, assumptionInput.trim()])
      setAssumptionInput('')
    }
  }

  const removeAssumption = (index: number) => {
    setAssumptions(assumptions.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    if (!user) {
      setMessage('ログインが必要です')
      return
    }

    if (!title.trim() || !content.trim() || !background.trim() || !reason.trim()) {
      setMessage('必須項目を入力してください')
      return
    }

    if (choices.some(c => !c.label.trim())) {
      setMessage('すべての選択肢にラベルを入力してください')
      return
    }

    const result = await createLog({
      user_id: user.id,
      title,
      content,
      background,
      reason,
      status: 'pending',
      choices,
      selected_choice_id: null,
      type,
      tags: tags.length > 0 ? tags : undefined,
      constraints: constraints.length > 0 ? constraints : undefined,
      risks: risks.length > 0 ? risks : undefined,
      assumptions: assumptions.length > 0 ? assumptions : undefined,
    })

    if (result) {
      setMessage('✅ 判断ログを保存しました')
      // フォームをリセット
      setTimeout(() => {
        setTitle('')
        setContent('')
        setBackground('')
        setReason('')
        setType('strategy')
        setTags([])
        setChoices([{ id: '1', label: '', pros: [], cons: [] }])
        setSelectedChoiceId('1')
        setConstraints([])
        setRisks([])
        setAssumptions([])
        onSuccess?.()
      }, 1000)
    } else {
      setMessage(`❌ エラーが発生しました: ${error}`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">判断ログを記録</h2>

        {message && (
          <div className={`mb-6 p-4 rounded ${
            message.startsWith('✅')
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本情報 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="例: Q2の新機能優先順位決定"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              背景・状況 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="判断する際の背景や状況を説明"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              判断内容 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="実際の判断内容を記述"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              判断理由 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="なぜこの判断をしたのかの理由"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                判断タイプ
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as DecisionType)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="strategy">戦略</option>
                <option value="implementation">実装</option>
                <option value="operation">運用</option>
                <option value="emergency">緊急</option>
              </select>
            </div>
          </div>

          {/* タグ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              タグ
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="タグを入力"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                追加
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full flex items-center gap-2 text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(i)}
                    className="hover:text-indigo-900"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* 選択肢 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              検討した選択肢 <span className="text-red-500">*</span>
            </label>
            <div className="space-y-4">
              {choices.map((choice) => (
                <div key={choice.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={choice.label}
                      onChange={(e) => updateChoice(choice.id, 'label', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="選択肢のラベル（例: AI要約機能）"
                    />
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={selectedChoiceId === choice.id}
                        onChange={() => setSelectedChoiceId(choice.id)}
                        className="h-4 w-4"
                      />
                      <span className="text-sm text-gray-600">この選択肢を選びました</span>
                    </label>
                    {choices.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeChoice(choice.id)}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        この選択肢を削除
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addChoice}
              className="mt-4 px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50"
            >
              選択肢を追加
            </button>
          </div>

          {/* 制約条件 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              制約条件
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={constraintInput}
                onChange={(e) => setConstraintInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addConstraint())}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="制約条件を入力"
              />
              <button
                type="button"
                onClick={addConstraint}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                追加
              </button>
            </div>
            <div className="space-y-2">
              {constraints.map((constraint, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                  <span className="text-sm">{constraint}</span>
                  <button
                    type="button"
                    onClick={() => removeConstraint(i)}
                    className="text-red-600 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* リスク */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              リスク
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={riskInput}
                onChange={(e) => setRiskInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRisk())}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="リスクを入力"
              />
              <button
                type="button"
                onClick={addRisk}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                追加
              </button>
            </div>
            <div className="space-y-2">
              {risks.map((risk, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                  <span className="text-sm">{risk}</span>
                  <button
                    type="button"
                    onClick={() => removeRisk(i)}
                    className="text-red-600 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 前提条件 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              前提条件
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={assumptionInput}
                onChange={(e) => setAssumptionInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAssumption())}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="前提条件を入力"
              />
              <button
                type="button"
                onClick={addAssumption}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                追加
              </button>
            </div>
            <div className="space-y-2">
              {assumptions.map((assumption, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                  <span className="text-sm">{assumption}</span>
                  <button
                    type="button"
                    onClick={() => removeAssumption(i)}
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
            className="w-full px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {isLoading ? '保存中...' : '判断ログを保存'}
          </button>
        </form>
      </div>
    </div>
  )
}

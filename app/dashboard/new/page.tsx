'use client'

import { useRouter } from 'next/navigation'
import DecisionLogForm from '@/components/DecisionLogForm'

export default function NewDecisionLogPage() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">新規判断ログ作成</h1>
      </div>

      <DecisionLogForm
        onSuccess={() => {
          setTimeout(() => {
            router.push('/dashboard')
          }, 1500)
        }}
      />
    </div>
  )
}

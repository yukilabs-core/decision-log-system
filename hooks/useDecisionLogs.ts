'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { DecisionLog } from '@/types'

export function useDecisionLogs() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getLogs = async (
    userId: string,
    filter?: {
      status?: string
      type?: string
      tags?: string[]
      search?: string
      limit?: number
      offset?: number
    }
  ) => {
    setIsLoading(true)
    setError(null)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)

    try {
      let query = supabase
        .from('decision_logs')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (filter?.status) {
        query = query.eq('status', filter.status)
      }

      if (filter?.type) {
        query = query.eq('type', filter.type)
      }

      if (filter?.tags && filter.tags.length > 0) {
        query = query.contains('tags', filter.tags)
      }

      if (filter?.search) {
        query = query.or(
          `title.ilike.%${filter.search}%,content.ilike.%${filter.search}%,reason.ilike.%${filter.search}%`
        )
      }

      const limit = filter?.limit || 20
      const offset = filter?.offset || 0
      query = query.range(offset, offset + limit - 1)

      const { data, error: err, count } = await query

      if (err) throw err

      setIsLoading(false)
      return { logs: data as DecisionLog[], total: count || 0 }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch logs'
      setError(message)
      setIsLoading(false)
      console.error('[getLogs] Error:', message)
      return { logs: [], total: 0 }
    } finally {
      clearTimeout(timeoutId)
      controller.abort()
    }
  }

  const getLog = async (id: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('decision_logs')
        .select('*')
        .eq('id', id)
        .single()

      if (err) throw err
      return data as DecisionLog
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch log'
      setError(message)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const createLog = async (log: Omit<DecisionLog, 'id' | 'created_at' | 'updated_at'>) => {
    setIsLoading(true)
    setError(null)
    try {
      console.log('[CreateLog] Sending data:', log)
      const { data, error: err } = await supabase
        .from('decision_logs')
        .insert([log])
        .select()
        .single()

      console.log('[CreateLog] Response:', { data, err })
      if (err) throw err
      return data as DecisionLog
    } catch (err) {
      const message = err instanceof Error ? err.message : JSON.stringify(err)
      console.error('[CreateLog] Error:', message)
      setError(message)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const updateLog = async (id: string, updates: Partial<DecisionLog>) => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('decision_logs')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (err) throw err
      return data as DecisionLog
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update log'
      setError(message)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const deleteLog = async (id: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const { error: err } = await supabase
        .from('decision_logs')
        .delete()
        .eq('id', id)

      if (err) throw err
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete log'
      setError(message)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    error,
    getLogs,
    getLog,
    createLog,
    updateLog,
    deleteLog,
  }
}

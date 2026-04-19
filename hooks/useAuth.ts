'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User, AuthState } from '@/types'

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setState({
            user: {
              id: session.user.id,
              email: session.user.email || '',
            },
            isLoading: false,
            error: null,
          })
        } else {
          setState({
            user: null,
            isLoading: false,
            error: null,
          })
        }
      } catch (error) {
        setState({
          user: null,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Auth error',
        })
      }
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setState({
            user: {
              id: session.user.id,
              email: session.user.email || '',
            },
            isLoading: false,
            error: null,
          })
        } else {
          setState({
            user: null,
            isLoading: false,
            error: null,
          })
        }
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const signup = async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    try {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Check your email to confirm signup',
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Signup failed',
      }))
    }
  }

  const login = async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }))
    }
  }

  const logout = async () => {
    setState(prev => ({ ...prev, isLoading: true }))
    try {
      await supabase.auth.signOut()
      setState({
        user: null,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Logout failed',
      }))
    }
  }

  return { ...state, signup, login, logout }
}

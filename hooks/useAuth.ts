'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User, AuthState } from '@/types'

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  })
  const demoLoginAttempted = useRef(false)

  useEffect(() => {
    let isMounted = true

    const checkAuth = async () => {
      try {
        console.log('[Auth] Checking session...')
        const { data: { session } } = await supabase.auth.getSession()
        console.log('[Auth] Session:', session ? 'Found' : 'None')

        if (!isMounted) return

        if (session?.user) {
          console.log('[Auth] User already logged in:', session.user.email)
          setState({
            user: {
              id: session.user.id,
              email: session.user.email || '',
            },
            isLoading: false,
            error: null,
          })
        } else if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && !demoLoginAttempted.current) {
          demoLoginAttempted.current = true
          console.log('[Auth] Demo mode enabled, attempting auto-login with email:', process.env.NEXT_PUBLIC_DEMO_EMAIL)

          try {
            const { error, data } = await supabase.auth.signInWithPassword({
              email: process.env.NEXT_PUBLIC_DEMO_EMAIL || '',
              password: process.env.NEXT_PUBLIC_DEMO_PASSWORD || '',
            })

            console.log('[Auth] Demo login response received - error:', error?.message || 'none', 'user:', data.user?.email)

            if (!isMounted) {
              console.log('[Auth] Component unmounted, skipping state update')
              return
            }

            if (error) {
              console.error('[Auth] Demo login error:', error.message)
              throw error
            }

            console.log('[Auth] Demo login success:', data.user?.email)
            setState({
              user: {
                id: data.user?.id || '',
                email: data.user?.email || '',
              },
              isLoading: false,
              error: null,
            })
          } catch (demoError) {
            if (!isMounted) {
              console.log('[Auth] Component unmounted during error handling')
              return
            }
            const errorMsg = demoError instanceof Error ? demoError.message : 'Demo login failed'
            console.error('[Auth] Demo login caught error:', errorMsg)
            setState({
              user: null,
              isLoading: false,
              error: errorMsg,
            })
          }
        } else {
          console.log('[Auth] No demo mode, no session')
          setState({
            user: null,
            isLoading: false,
            error: null,
          })
        }
      } catch (error) {
        if (!isMounted) return
        const errorMsg = error instanceof Error ? error.message : 'Auth error'
        console.error('[Auth] Unexpected error:', errorMsg)
        setState({
          user: null,
          isLoading: false,
          error: errorMsg,
        })
      }
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!isMounted) return

        console.log('[Auth] Auth state changed:', _event, session?.user?.email || 'null')
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
      console.log('[Auth] Cleanup: unsubscribing from auth state changes')
      isMounted = false
      subscription?.unsubscribe()
    }
  }, [])

  console.log('[Auth] Current state - User:', state.user?.email || 'null', 'Loading:', state.isLoading, 'Error:', state.error || 'none')

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

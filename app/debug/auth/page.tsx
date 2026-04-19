'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthDebugPage() {
  const [status, setStatus] = useState<string>('Initializing...')
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (msg: string) => {
    console.log(msg)
    setLogs(prev => [...prev, msg])
  }

  useEffect(() => {
    const testAuth = async () => {
      try {
        addLog('1. Testing Supabase connection...')
        const { data: { session } } = await supabase.auth.getSession()
        addLog(`2. Session check result: ${session ? 'Found' : 'None'}`)

        if (session) {
          addLog(`3. User: ${session.user.email}`)
          setStatus('Already logged in')
          return
        }

        addLog('4. No session, attempting demo login...')
        const demoEmail = process.env.NEXT_PUBLIC_DEMO_EMAIL
        const demoPassword = process.env.NEXT_PUBLIC_DEMO_PASSWORD
        addLog(`5. Demo credentials: ${demoEmail} / ${demoPassword?.substring(0, 3)}...`)

        const { error, data } = await supabase.auth.signInWithPassword({
          email: demoEmail || '',
          password: demoPassword || '',
        })

        if (error) {
          addLog(`6. Login error: ${error.message}`)
          setStatus(`Failed: ${error.message}`)
          return
        }

        addLog(`7. Login success: ${data.user?.email}`)
        setStatus('Logged in successfully')
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        addLog(`Error: ${msg}`)
        setStatus(`Error: ${msg}`)
      }
    }

    testAuth()
  }, [])

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Auth Debug Page</h1>
      <p className="mb-4 text-lg">Status: <strong>{status}</strong></p>

      <div className="bg-gray-100 p-4 rounded font-mono text-sm space-y-1">
        {logs.map((log, i) => (
          <div key={i} className="text-gray-700">{log}</div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-bold mb-2">Environment Variables:</h2>
        <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
{`NEXT_PUBLIC_SUPABASE_URL=${process.env.NEXT_PUBLIC_SUPABASE_URL}
NEXT_PUBLIC_DEMO_MODE=${process.env.NEXT_PUBLIC_DEMO_MODE}
NEXT_PUBLIC_DEMO_EMAIL=${process.env.NEXT_PUBLIC_DEMO_EMAIL}
NEXT_PUBLIC_DEMO_PASSWORD=${process.env.NEXT_PUBLIC_DEMO_PASSWORD?.substring(0, 5)}...`}
        </pre>
      </div>
    </div>
  )
}

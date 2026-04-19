export type DecisionStatus = 'pending' | 'success' | 'failed' | 'hold'
export type DecisionType = 'strategy' | 'implementation' | 'operation' | 'emergency'

export interface Choice {
  id: string
  label: string
  pros: string[]
  cons: string[]
}

export interface DecisionLog {
  id: string
  user_id: string
  title: string
  content: string
  background: string
  reason: string
  status: DecisionStatus
  choices: Choice[]
  selected_choice_id?: string
  type?: DecisionType
  tags?: string[]
  constraints?: string[]
  risks?: string[]
  assumptions?: string[]
  outcome?: string | null
  learning?: string[] | null
  next_actions?: string[] | null
  created_at: string
  updated_at: string
  reviewed_at?: string | null
}

export interface DecisionReview {
  id: string
  decision_log_id: string
  outcome: string
  learning: string[]
  created_at: string
}

export interface User {
  id: string
  email: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
}

// Auth Types
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  edad?: number
  genero?: string
  ocupacion?: string
  estiloCoaching?: string
  createdAt: string
}

export interface AuthResponse {
  token: string
  user: User
}

// Session Types
export type SessionStatus = 'ACTIVE' | 'PAUSED' | 'CLOSED'

export interface Session {
  id: string
  usuarioId: string
  goalId?: string
  objetivo?: string
  etapaActual: string
  realidad?: string
  opciones?: string[]
  voluntad?: string
  resumen?: string
  reflexion?: string
  planAccion?: string
  criadaEn: string
  actualizadaEn: string
  finalizadaEn?: string
  status: SessionStatus
  expiresAt: string
  pausedAt?: string
  pausedDuration: number
  warningShownAt?: string
}

export interface CreateSessionRequest {
  usuarioId: string
  goalId?: string
  objetivo?: string
  tema?: string
}

// Message Types
export interface Message {
  id: string
  sessionId: string
  role: 'user' | 'assistant'
  content: string
  crisisDetected?: boolean
  crisisLevel?: 'critico' | 'alto' | 'medio' | 'bajo' | 'ninguno'
  timestamp: string
}

export interface ChatRequest {
  sessionId: string
  userId: string
  message: string
}

export interface ChatResponse {
  id: string
  role: 'assistant'
  content: string
  crisisLevel?: string
  timestamp: string
}

// GROW Framework Types
export interface Goal {
  id: string
  description: string
  status: 'not_started' | 'in_progress' | 'completed'
  dueDate?: string
  metrics?: string[]
}

export interface GoalSession {
  sessionId: string
  goal: Goal
  reality: string
  options: string[]
  will: string
  followUp: string
}

// API Response Types
export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// UI Types
export type CrisisLevel = 'critico' | 'alto' | 'medio' | 'bajo' | 'ninguno'
export type Theme = 'light' | 'dark'
export type Language = 'en' | 'es'

export interface UIState {
  sidebarOpen: boolean
  theme: Theme
  language: Language
  notifications: Notification[]
}

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  message: string
  duration?: number
}

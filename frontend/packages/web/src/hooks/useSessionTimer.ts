import { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '@/store'
import { updateSessionStatus } from '@/store/slices/sessionsSlice'
import { useNotification } from './useNotification'
import { apiClient } from '@/services/apiClient'
import type { SessionStatus } from '@/types'

const INACTIVITY_THRESHOLD = 10 * 60 * 1000 // 10 minutes
const WARNING_TIME = 2 * 60 * 1000 // 2 minutes
const TIMER_INTERVAL = 100 // 100ms for smooth countdown

interface UseSessionTimerReturn {
  remainingMs: number
  status: SessionStatus
  timeRemaining: string
  isPaused: boolean
}

export function useSessionTimer(sessionId: string | null, expiresAt: string | null): UseSessionTimerReturn {
  const dispatch = useDispatch()
  const { notifyWarning } = useNotification()
  const lastActivityAt = useSelector((state: RootState) => state.sessions.lastActivityAt)
  const [remainingMs, setRemainingMs] = useState(0)
  const [status, setStatus] = useState<SessionStatus>('ACTIVE')
  const [warningShown, setWarningShown] = useState(false)

  // Calculate remaining time
  const calculateRemaining = useCallback(() => {
    if (!expiresAt) return 0
    const now = Date.now()
    const expiry = new Date(expiresAt).getTime()
    return Math.max(0, expiry - now)
  }, [expiresAt])

  // Format time as MM:SS
  const formatTime = useCallback((ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }, [])

  // Update timer state
  useEffect(() => {
    if (!expiresAt || !sessionId) return

    const interval = setInterval(() => {
      const remaining = calculateRemaining()
      setRemainingMs(remaining)

      // Check if session expired
      if (remaining <= 0) {
        setStatus('CLOSED')
        clearInterval(interval)
        // Auto-close session on backend
        apiClient.patch(`/api/sessions/${sessionId}/status`, { status: 'CLOSED' }).catch(console.error)
        return
      }

      // Check for warning (2 minutes before expiry)
      if (remaining <= WARNING_TIME && !warningShown) {
        setWarningShown(true)
        notifyWarning({
          message: `Session ending in ${formatTime(remaining)}`,
          duration: 5000,
        })
      }
    }, TIMER_INTERVAL)

    return () => clearInterval(interval)
  }, [expiresAt, sessionId, calculateRemaining, formatTime, notifyWarning, warningShown])

  // Check inactivity and pause if needed
  useEffect(() => {
    if (!sessionId || status !== 'ACTIVE') return

    const inactivityInterval = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivityAt
      if (timeSinceLastActivity > INACTIVITY_THRESHOLD) {
        setStatus('PAUSED')
        dispatch(updateSessionStatus({ sessionId, status: 'PAUSED' }))
        // Pause session on backend
        apiClient.post(`/api/sessions/${sessionId}/pause`, {}).catch(console.error)
      }
    }, 1000) // Check every second

    return () => clearInterval(inactivityInterval)
  }, [sessionId, status, lastActivityAt, dispatch])

  const isPaused = status === 'PAUSED'

  return {
    remainingMs,
    status,
    timeRemaining: formatTime(remainingMs),
    isPaused,
  }
}

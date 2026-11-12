import { useState, useEffect, useCallback, useRef } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { useSelector } from 'react-redux'
import { useQueryClient } from '@tanstack/react-query'
import { updateSessionStatus } from '@/store/slices/sessionsSlice'
import { useNotification } from './useNotification'
import { apiClient } from '@/services/apiClient'
import type { RootState } from '@/store'

// Phase 2: Dual Timeout System
const SESSION_DURATION = 45 * 60 * 1000 // 45 minutes
const INACTIVITY_TIMEOUT = 15 * 60 * 1000 // 15 minutes inactivity → PAUSED
const WARNING_TIME = 2 * 60 * 1000 // 2 minutes before expiry warning
const TIMER_INTERVAL = 1000 // 1s interval for performance (avoid excessive re-renders)

interface TimerState {
  firstMessageAt: number
  lastActivityAt: number
}

interface UseSessionTimerReturn {
  remainingMs: number
  timeRemaining: string
  isTimerRunning: boolean
  startTimer: (forceSessionId?: string) => void
  canCreateNewSession: boolean
  updateActivity: () => void // Track last activity for inactivity timeout
}

const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined'

export function useSessionTimer(sessionId: string | null, sessionStatus?: string, expiresAt?: string | Date | null): UseSessionTimerReturn {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()
  const { user } = useSelector((state: RootState) => state.auth)
  const { notifyWarning } = useNotification()
  const [remainingMs, setRemainingMs] = useState(SESSION_DURATION)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  // Refs instead of state: changes don't need to restart the countdown interval
  const timerStartTimeRef = useRef<number | null>(null)
  const lastActivityAtRef = useRef<number | null>(null)
  const warningShownRef = useRef(false)
  const inactivityPausedRef = useRef(false) // tracks if we already dispatched PAUSED for inactivity

  // Get localStorage keys for this session
  const getTimerStorageKey = useCallback((id?: string) => `timer_${id || sessionId}`, [sessionId])
  const getActivityStorageKey = useCallback((id?: string) => `activity_${id || sessionId}`, [sessionId])

  // Initialize timer state from localStorage (resume/refresh) or from session expiresAt (device takeover)
  useEffect(() => {
    if (!sessionId || !isBrowser) return
    try {
      const timerKey = getTimerStorageKey()
      const activityKey = getActivityStorageKey()
      const storedTimer = localStorage.getItem(timerKey)

      if (storedTimer) {
        const timerData: TimerState = JSON.parse(storedTimer)
        const firstMessageAt = timerData.firstMessageAt
        const storedActivity = timerData.lastActivityAt || firstMessageAt
        const elapsed = Date.now() - firstMessageAt

        if (elapsed >= SESSION_DURATION) {
          setRemainingMs(0)
          setIsTimerRunning(false)
          localStorage.removeItem(timerKey)
          localStorage.removeItem(activityKey)
          dispatch(updateSessionStatus({ sessionId, status: 'CLOSED' }))
          apiClient.patch(`/api/sessions/${sessionId}/status`, { status: 'CLOSED' })
            .then(() => queryClient.invalidateQueries({ queryKey: ['sessions', user?.id] }))
            .catch(() => queryClient.invalidateQueries({ queryKey: ['sessions', user?.id] }))
          return
        }

        // Inactivity during offline: dispatch PAUSED, keep timer running
        const inactivityTime = Date.now() - storedActivity
        if (inactivityTime >= INACTIVITY_TIMEOUT) {
          inactivityPausedRef.current = true
          dispatch(updateSessionStatus({ sessionId, status: 'PAUSED' }))
        }

        timerStartTimeRef.current = firstMessageAt
        lastActivityAtRef.current = storedActivity
        setIsTimerRunning(true)
        setRemainingMs(SESSION_DURATION - elapsed)
        return
      }

      // No localStorage data — initialize from session's expiresAt (phone taking over from PC)
      if (expiresAt) {
        const expiry = new Date(expiresAt).getTime()
        const now = Date.now()
        // Cap remaining at SESSION_DURATION to prevent syntheticStart going into the future
        const remaining = Math.min(Math.max(0, expiry - now), SESSION_DURATION)
        if (remaining > 0) {
          const syntheticStart = now - (SESSION_DURATION - remaining)
          timerStartTimeRef.current = syntheticStart
          lastActivityAtRef.current = now
          setIsTimerRunning(true)
          setRemainingMs(remaining)
          localStorage.setItem(timerKey, JSON.stringify({
            firstMessageAt: syntheticStart,
            lastActivityAt: now,
          }))
        }
      }
    } catch (error) {
      console.error('Error reading timer from localStorage:', error)
    }
  }, [sessionId, expiresAt, getTimerStorageKey, getActivityStorageKey, dispatch])

  // Start timer function - called when session is created
  // forceSessionId: pass the new session's ID directly (avoids stale closure issue)
  const startTimer = useCallback((forceSessionId?: string) => {
    const effectiveId = forceSessionId || sessionId
    if (isTimerRunning || !effectiveId) return
    const now = Date.now()
    timerStartTimeRef.current = now
    lastActivityAtRef.current = now
    warningShownRef.current = false
    setIsTimerRunning(true)
    setRemainingMs(SESSION_DURATION)

    if (isBrowser) {
      try {
        const timerData: TimerState = {
          firstMessageAt: now,
          lastActivityAt: now,
        }
        localStorage.setItem(getTimerStorageKey(effectiveId), JSON.stringify(timerData))
      } catch (error) {
        console.error('Error saving timer to localStorage:', error)
      }
    }
  }, [isTimerRunning, sessionId, getTimerStorageKey])

  // Update last activity (called on each message sent)
  const updateActivity = useCallback(() => {
    if (!isTimerRunning || !sessionId) return
    const now = Date.now()
    lastActivityAtRef.current = now
    inactivityPausedRef.current = false // reset so inactivity can trigger PAUSED again

    if (isBrowser && timerStartTimeRef.current) {
      try {
        const timerData: TimerState = {
          firstMessageAt: timerStartTimeRef.current,
          lastActivityAt: now,
        }
        localStorage.setItem(getTimerStorageKey(), JSON.stringify(timerData))
      } catch (error) {
        console.error('Error updating activity in localStorage:', error)
      }
    }
  }, [isTimerRunning, sessionId, getTimerStorageKey])

  // Format time as MM:SS
  const formatTime = useCallback((ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }, [])

  // Timer countdown effect - Phase 2: Dual timeout logic
  // Depends only on isTimerRunning/sessionId — refs give the interval the latest values without restarting it
  useEffect(() => {
    if (!isTimerRunning || !sessionId) return
    if (!timerStartTimeRef.current || !lastActivityAtRef.current) return

    const interval = setInterval(() => {
      const now = Date.now()
      const durationElapsed = now - timerStartTimeRef.current!
      const inactivityElapsed = now - lastActivityAtRef.current!

      // Check duration timeout → CLOSED in Redux + backend + React Query cache
      if (durationElapsed >= SESSION_DURATION) {
        setIsTimerRunning(false)
        clearInterval(interval)
        setRemainingMs(0)
        dispatch(updateSessionStatus({ sessionId, status: 'CLOSED' }))
        apiClient.patch(`/api/sessions/${sessionId}/status`, { status: 'CLOSED' })
          .then(() => queryClient.invalidateQueries({ queryKey: ['sessions', user?.id] }))
          .catch(() => queryClient.invalidateQueries({ queryKey: ['sessions', user?.id] }))
        if (isBrowser) {
          try { localStorage.removeItem(getTimerStorageKey()) } catch (_) {}
        }
        return
      }

      // Check inactivity timeout (15 minutes without activity → PAUSED, not CLOSED)
      if (inactivityElapsed >= INACTIVITY_TIMEOUT && !inactivityPausedRef.current) {
        inactivityPausedRef.current = true
        dispatch(updateSessionStatus({ sessionId, status: 'PAUSED' }))
        apiClient.post(`/api/sessions/${sessionId}/pause`, {}).catch(() => {})
        // Timer keeps running - useActivityDetector will resume to ACTIVE when user acts
      }

      // Calculate remaining time based on 45-min session duration only
      const remaining = Math.max(0, SESSION_DURATION - durationElapsed)

      setRemainingMs(remaining)

      // Warning at 2 minutes before expiry
      if (remaining <= WARNING_TIME && !warningShownRef.current) {
        warningShownRef.current = true
        notifyWarning({
          message: `Session ending in ${formatTime(remaining)}. Save your work.`,
          duration: 5000,
        })
      }
    }, TIMER_INTERVAL)

    return () => clearInterval(interval)
  }, [isTimerRunning, sessionId, formatTime, notifyWarning, getTimerStorageKey, dispatch])

  // Stop timer immediately when session is CLOSED externally (e.g. via markClosed in ChatPage)
  useEffect(() => {
    if (sessionStatus === 'CLOSED' && isTimerRunning) {
      setIsTimerRunning(false)
      setRemainingMs(0)
      if (isBrowser) {
        try { localStorage.removeItem(getTimerStorageKey()) } catch (_) {}
      }
    }
  }, [sessionStatus, isTimerRunning, getTimerStorageKey])

  // Can create new session only if timer is not running
  const canCreateNewSession = !isTimerRunning || remainingMs <= 0

  return {
    remainingMs,
    timeRemaining: formatTime(remainingMs),
    isTimerRunning,
    startTimer,
    canCreateNewSession,
    updateActivity,
  }
}

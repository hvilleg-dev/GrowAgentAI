import { useState, useEffect, useCallback, useRef } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { updateSessionStatus } from '@/store/slices/sessionsSlice'
import { useNotification } from './useNotification'

// Phase 2: Dual Timeout System
const SESSION_DURATION = 45 * 60 * 1000 // 45 minutes from first message
const INACTIVITY_TIMEOUT = 15 * 60 * 1000 // 15 minutes without sending message
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

export function useSessionTimer(sessionId: string | null, sessionStatus?: string): UseSessionTimerReturn {
  const dispatch = useAppDispatch()
  const { notifyWarning } = useNotification()
  const [remainingMs, setRemainingMs] = useState(SESSION_DURATION)
  const [warningShown, setWarningShown] = useState(false)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [timerStartTime, setTimerStartTime] = useState<number | null>(null)
  const [lastActivityAt, setLastActivityAt] = useState<number | null>(null)
  const inactivityPausedRef = useRef(false) // tracks if we already dispatched PAUSED for inactivity

  // Get localStorage keys for this session
  const getTimerStorageKey = useCallback((id?: string) => `timer_${id || sessionId}`, [sessionId])
  const getActivityStorageKey = useCallback((id?: string) => `activity_${id || sessionId}`, [sessionId])

  // Initialize timer state from localStorage (app resume/refresh)
  useEffect(() => {
    if (!sessionId || !isBrowser) return
    try {
      const timerKey = getTimerStorageKey()
      const activityKey = getActivityStorageKey()
      const storedTimer = localStorage.getItem(timerKey)
      const storedActivity = localStorage.getItem(activityKey)

      if (storedTimer) {
        const timerData: TimerState = JSON.parse(storedTimer)
        const firstMessageAt = timerData.firstMessageAt
        const lastActivityAt = timerData.lastActivityAt || firstMessageAt

        // Check if timer already expired
        const elapsed = Date.now() - firstMessageAt
        if (elapsed >= SESSION_DURATION) {
          // Duration timeout reached
          setRemainingMs(0)
          setIsTimerRunning(false)
          localStorage.removeItem(timerKey)
          dispatch(updateSessionStatus({ sessionId, status: 'CLOSED' }))
          return
        }

        // Check inactivity timeout
        const inactivityTime = Date.now() - lastActivityAt
        if (inactivityTime >= INACTIVITY_TIMEOUT) {
          // Inactivity timeout reached
          setRemainingMs(0)
          setIsTimerRunning(false)
          localStorage.removeItem(timerKey)
          localStorage.removeItem(activityKey)
          dispatch(updateSessionStatus({ sessionId, status: 'CLOSED' }))
          return
        }

        // Timer still valid
        setTimerStartTime(firstMessageAt)
        setLastActivityAt(lastActivityAt)
        setIsTimerRunning(true)
        setRemainingMs(SESSION_DURATION - elapsed)
      }
    } catch (error) {
      console.error('Error reading timer from localStorage:', error)
    }
  }, [sessionId, getTimerStorageKey, getActivityStorageKey, dispatch])

  // Start timer function - called when session is created
  // forceSessionId: pass the new session's ID directly (avoids stale closure issue)
  const startTimer = useCallback((forceSessionId?: string) => {
    const effectiveId = forceSessionId || sessionId
    if (isTimerRunning || !effectiveId) return
    const now = Date.now()
    setTimerStartTime(now)
    setLastActivityAt(now)
    setIsTimerRunning(true)
    setRemainingMs(SESSION_DURATION)
    setWarningShown(false)

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
    setLastActivityAt(now)
    inactivityPausedRef.current = false // reset so inactivity can trigger PAUSED again

    if (isBrowser && timerStartTime) {
      try {
        const timerData: TimerState = {
          firstMessageAt: timerStartTime,
          lastActivityAt: now,
        }
        localStorage.setItem(getTimerStorageKey(), JSON.stringify(timerData))
      } catch (error) {
        console.error('Error updating activity in localStorage:', error)
      }
    }
  }, [isTimerRunning, sessionId, timerStartTime, getTimerStorageKey])

  // Format time as MM:SS
  const formatTime = useCallback((ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }, [])

  // Timer countdown effect - Phase 2: Dual timeout logic
  useEffect(() => {
    if (!isTimerRunning || !sessionId || !timerStartTime || !lastActivityAt) return

    const interval = setInterval(() => {
      const now = Date.now()
      const durationElapsed = now - timerStartTime
      const inactivityElapsed = now - lastActivityAt

      // Check duration timeout (45 minutes from first message)
      if (durationElapsed >= SESSION_DURATION) {
        setIsTimerRunning(false)
        clearInterval(interval)
        setRemainingMs(0)
        dispatch(updateSessionStatus({ sessionId, status: 'CLOSED' }))
        if (isBrowser) {
          try {
            localStorage.removeItem(getTimerStorageKey())
          } catch (error) {
            console.error('Error removing timer from localStorage:', error)
          }
        }
        return
      }

      // Check inactivity timeout (15 minutes without activity → PAUSED, not CLOSED)
      if (inactivityElapsed >= INACTIVITY_TIMEOUT && !inactivityPausedRef.current) {
        inactivityPausedRef.current = true
        dispatch(updateSessionStatus({ sessionId, status: 'PAUSED' }))
        // Timer keeps running - session is paused but not closed
        // useActivityDetector will resume to ACTIVE when user acts
      }

      // Calculate remaining time based on 45-min session duration only
      const remaining = Math.max(0, SESSION_DURATION - durationElapsed)

      setRemainingMs(remaining)

      // Warning at 2 minutes before expiry
      if (remaining <= WARNING_TIME && !warningShown) {
        setWarningShown(true)
        notifyWarning({
          message: `Session ending in ${formatTime(remaining)}. Save your work.`,
          duration: 5000,
        })
      }
    }, TIMER_INTERVAL)

    return () => clearInterval(interval)
  }, [isTimerRunning, timerStartTime, lastActivityAt, sessionId, formatTime, notifyWarning, warningShown, getTimerStorageKey, dispatch])

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

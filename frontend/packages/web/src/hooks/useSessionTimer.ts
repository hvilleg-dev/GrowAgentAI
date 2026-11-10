import { useState, useEffect, useCallback } from 'react'
import { useNotification } from './useNotification'

const SESSION_DURATION = 45 * 60 * 1000 // 45 minutes
const WARNING_TIME = 2 * 60 * 1000 // 2 minutes before expiry
const TIMER_INTERVAL = 100 // 100ms for smooth countdown

interface UseSessionTimerReturn {
  remainingMs: number
  timeRemaining: string
  isTimerRunning: boolean
  startTimer: () => void
  canCreateNewSession: boolean
}

export function useSessionTimer(sessionId: string | null): UseSessionTimerReturn {
  const { notifyWarning } = useNotification()
  const [remainingMs, setRemainingMs] = useState(SESSION_DURATION)
  const [warningShown, setWarningShown] = useState(false)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [timerStartTime, setTimerStartTime] = useState<number | null>(null)

  // Get localStorage key for this session
  const getStorageKey = useCallback(() => `timer_${sessionId}`, [sessionId])

  // Initialize timer state from localStorage
  useEffect(() => {
    if (!sessionId) return
    const storageKey = getStorageKey()
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      const { startTime } = JSON.parse(stored)
      setTimerStartTime(startTime)
      setIsTimerRunning(true)
      // Check if timer already expired while app was closed
      const elapsed = Date.now() - startTime
      if (elapsed >= SESSION_DURATION) {
        setRemainingMs(0)
        setIsTimerRunning(false)
        localStorage.removeItem(storageKey)
      } else {
        setRemainingMs(SESSION_DURATION - elapsed)
      }
    }
  }, [sessionId, getStorageKey])

  // Start timer function - called from ChatPage when message is sent
  const startTimer = useCallback(() => {
    if (isTimerRunning || !sessionId) return
    const now = Date.now()
    setTimerStartTime(now)
    setIsTimerRunning(true)
    setRemainingMs(SESSION_DURATION)
    setWarningShown(false)
    localStorage.setItem(getStorageKey(), JSON.stringify({ startTime: now }))
  }, [isTimerRunning, sessionId, getStorageKey])

  // Format time as MM:SS
  const formatTime = useCallback((ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }, [])

  // Timer countdown effect
  useEffect(() => {
    if (!isTimerRunning || !sessionId || !timerStartTime) return

    const interval = setInterval(() => {
      const elapsed = Date.now() - timerStartTime
      const remaining = Math.max(0, SESSION_DURATION - elapsed)
      setRemainingMs(remaining)

      // Check if session expired
      if (remaining <= 0) {
        setIsTimerRunning(false)
        clearInterval(interval)
        localStorage.removeItem(getStorageKey())
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
  }, [isTimerRunning, timerStartTime, sessionId, formatTime, notifyWarning, warningShown, getStorageKey])

  // Can create new session only if timer is not running or already finished
  const canCreateNewSession = !isTimerRunning || remainingMs <= 0

  return {
    remainingMs,
    timeRemaining: formatTime(remainingMs),
    isTimerRunning,
    startTimer,
    canCreateNewSession,
  }
}

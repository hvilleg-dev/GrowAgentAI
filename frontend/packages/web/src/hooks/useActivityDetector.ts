import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setLastActivity, updateSessionStatus } from '@/store/slices/sessionsSlice'
import { apiClient } from '@/services/apiClient'
import type { RootState, AppDispatch } from '@/store'

const DEBOUNCE_TIME = 500 // Debounce activity detection to avoid spam

let lastActivityTime = Date.now()
let debounceTimer: ReturnType<typeof setTimeout> | null = null

export function useActivityDetector(sessionId: string | null, enabled: boolean = true) {
  const dispatch = useDispatch<AppDispatch>()
  const sessionStatus = useSelector((state: RootState) => {
    if (!sessionId) return null
    return state.sessions.items.find(s => s.id === sessionId)?.status
  })

  useEffect(() => {
    if (!enabled || !sessionId || sessionStatus !== 'PAUSED') return

    const handleActivity = () => {
      const now = Date.now()
      if (now - lastActivityTime < DEBOUNCE_TIME) return

      lastActivityTime = now
      dispatch(setLastActivity())

      // Resume session on backend and update local state
      apiClient.post(`/api/sessions/${sessionId}/resume`, {})
        .then(() => {
          // Update Redux state to reflect resumed status
          dispatch(updateSessionStatus({ sessionId, status: 'ACTIVE' }))
        })
        .catch(console.error)
    }

    const events = ['mousedown', 'keydown', 'touchstart', 'click']
    events.forEach(event => document.addEventListener(event, handleActivity))

    return () => {
      events.forEach(event => document.removeEventListener(event, handleActivity))
      if (debounceTimer) clearTimeout(debounceTimer)
    }
  }, [sessionId, enabled, sessionStatus, dispatch])
}

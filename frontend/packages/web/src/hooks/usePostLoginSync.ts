import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import type { RootState, AppDispatch } from '@/store'
import { useSessions } from './useSessions'
import { setCurrentSession } from '@/store/slices/sessionsSlice'
import { useNotification } from './useNotification'
import { logout } from '@/store/slices/authSlice'
import { apiClient } from '@/services/apiClient'

interface MultiDeviceConflict {
  hasConflict: boolean
  sessionId: string | null
  otherDeviceId: string | null
  timeRemaining?: number
  deviceStatus?: string
}

// Phase 5: Post-login sync - handle multi-device lock, session loading, crash recovery
export function usePostLoginSync() {
  const [multiDeviceConflict, setMultiDeviceConflict] = useState<MultiDeviceConflict>({
    hasConflict: false,
    sessionId: null,
    otherDeviceId: null,
  })
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { token, user } = useSelector((state: RootState) => state.auth)
  const { notifyWarning, notifyError } = useNotification()
  const { sessions, isLoading: isLoadingSessions } = useSessions()

  useEffect(() => {
    if (!token || !user || isLoadingSessions) return

    const performSync = async () => {
      try {
        // Phase 5: Generate or get device ID
        let currentDeviceId = localStorage.getItem('device_id')
        if (!currentDeviceId) {
          currentDeviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          localStorage.setItem('device_id', currentDeviceId)
        }

        // Phase 5: Check multi-device lock - see if another device has this session active
        const response = await apiClient.get(`/api/sessions/active-device/${user.id}`, {
          params: { currentDeviceId }
        })
        const { hasActiveSession, sessionId, deviceId, timeRemainingSeconds, status } = response.data

        if (hasActiveSession && deviceId !== currentDeviceId) {
          // Phase 5: Another device has active session - store conflict info for modal
          setMultiDeviceConflict({
            hasConflict: true,
            sessionId,
            otherDeviceId: deviceId,
            timeRemaining: timeRemainingSeconds,
            deviceStatus: status,
          })
        }

        // Phase 5: Detect if another device took over the session this device was using
        // When "Continuar aquí" is pressed on phone, the session's deviceId changes to phone's ID
        if (sessions && sessions.length > 0) {
          const myActiveSessionId = localStorage.getItem('current_session_id')
          if (myActiveSessionId) {
            const mySession = sessions.find(s => s.id === myActiveSessionId)
            // If our session now has a different deviceId → we were kicked out
            if (mySession && mySession.deviceId && mySession.deviceId !== currentDeviceId) {
              localStorage.removeItem('current_session_id')
              await dispatch(logout())
              window.location.href = '/login'
              return
            }
          }

          const activeSessions = sessions.filter(
            s => s.status === 'ACTIVE' || s.status === 'PAUSED' || !s.status
          )

          if (activeSessions.length > 0) {
            // Set most recent active session as current and track it
            const mostRecent = activeSessions.reduce((a, b) =>
              new Date(a.criadaEn) > new Date(b.criadaEn) ? a : b
            )
            dispatch(setCurrentSession(mostRecent))
            localStorage.setItem('current_session_id', mostRecent.id)
          }
          // No notification when all sessions closed - user sees the locked chat naturally
        }

        // Phase 5: App crash recovery - check localStorage for unfinished state
        const savedTimerId = Object.keys(localStorage)
          .find(key => key.startsWith('timer_'))
        if (savedTimerId) {
          const sessionIdFromTimer = savedTimerId.replace('timer_', '')
          const session = sessions?.find(s => s.id === sessionIdFromTimer)

          if (session && (session.status === 'ACTIVE' || session.status === 'PAUSED')) {
            // Recover timer and session
            dispatch(setCurrentSession(session))
            // Timer will be recovered by useSessionTimer hook
          } else {
            // Session not found or closed - clean up localStorage
            localStorage.removeItem(savedTimerId)
          }
        }
      } catch (error) {
        console.error('Error in post-login sync:', error)
        // Silently fail - don't break login flow
      }
    }

    performSync()
  }, [token, user, sessions, isLoadingSessions, dispatch, navigate, notifyWarning, notifyError])

  return {
    multiDeviceConflict,
    setMultiDeviceConflict,
  }
}

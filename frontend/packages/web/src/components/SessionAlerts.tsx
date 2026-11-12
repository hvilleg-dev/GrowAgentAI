import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'
import { useNotification } from '@/hooks/useNotification'

// Phase 6: Session Alerts & Notifications
interface SessionAlertsProps {
  remainingMs: number
  isTimerRunning: boolean
  sessionStatus?: string
}

const WARNING_THRESHOLD = 2 * 60 * 1000 // 2 minutes
const INACTIVITY_THRESHOLD = 15 * 60 * 1000 // 15 minutes
const INACTIVITY_WARNING_THRESHOLD = 20 * 60 * 1000 // Show warning at 15min mark

export function useSessionAlerts({
  remainingMs,
  isTimerRunning,
  sessionStatus,
}: SessionAlertsProps) {
  const { notifyWarning, notifyInfo, notifyError } = useNotification()
  const { current: currentSession } = useSelector((state: RootState) => state.sessions)
  const [lastWarningTime, setLastWarningTime] = useState<number>(0)
  const [networkLossNotificationId, setNetworkLossNotificationId] = useState<string | null>(null)
  const [pausedNotificationShown, setPausedNotificationShown] = useState(false)

  // Phase 6: 2-minute warning before session ends
  useEffect(() => {
    if (isTimerRunning && remainingMs <= WARNING_THRESHOLD && remainingMs > 0) {
      const now = Date.now()
      // Only show warning once per 30 seconds to avoid spam
      if (now - lastWarningTime > 30000) {
        const minutes = Math.ceil(remainingMs / 60000)
        notifyWarning({
          message: `Tu sesión termina en ${minutes} minuto${minutes !== 1 ? 's' : ''}. Guarda tu trabajo.`,
          duration: 5000,
        })
        setLastWarningTime(now)
      }
    }
  }, [isTimerRunning, remainingMs, lastWarningTime, notifyWarning])

  // Phase 6: Session ended notification
  useEffect(() => {
    if (sessionStatus === 'CLOSED' && isTimerRunning === false) {
      notifyInfo({
        message: 'Tu sesión ha terminado. Los mensajes están archivados.',
        duration: 5000,
      })
    }
  }, [sessionStatus, isTimerRunning, notifyInfo])

  // Phase 6: Inactivity warning (approaching 15 minutes)
  // Note: This is triggered from useSessionTimer when inactivity > 10 minutes
  // Frontend can notify here when needed

  // Phase 6: Network loss detection and recovery
  useEffect(() => {
    const handleOnline = () => {
      if (networkLossNotificationId) {
        notifyInfo({
          message: 'Conexión restaurada. Sincronizando...',
          duration: 3000,
        })
        setNetworkLossNotificationId(null)
      }
    }

    const handleOffline = () => {
      const id = 'network-loss'
      notifyWarning({
        message: 'Conexión perdida. Intentando reconectar...',
        duration: 0, // Persistent until network restored
        id,
      })
      setNetworkLossNotificationId(id)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [networkLossNotificationId, notifyWarning, notifyInfo])

  // Phase 6: Session paused on another device - show once
  useEffect(() => {
    if (sessionStatus === 'PAUSED' && currentSession?.status === 'PAUSED' && !pausedNotificationShown) {
      notifyWarning({
        message: 'Tu sesión fue pausada en otro dispositivo. Puedes crear una nueva sesión aquí.',
        duration: 5000,
      })
      setPausedNotificationShown(true)
    }
  }, [sessionStatus, currentSession?.status, pausedNotificationShown, notifyWarning])
}

export default function SessionAlerts({ remainingMs, isTimerRunning, sessionStatus }: SessionAlertsProps) {
  // Component version of the hook - can be used separately if needed
  useSessionAlerts({ remainingMs, isTimerRunning, sessionStatus })
  return null // This component only manages side effects
}

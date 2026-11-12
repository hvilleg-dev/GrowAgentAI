import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { apiClient } from '@/services/apiClient'

interface MultiDeviceConflictModalProps {
  isOpen: boolean
  sessionId: string | null
  otherDeviceId: string | null
  timeRemaining?: number
  deviceStatus?: string
  onResolve: (action: 'pause-other' | 'back-to-other' | 'auto-timeout') => void
}

export default function MultiDeviceConflictModal({
  isOpen,
  sessionId,
  otherDeviceId,
  timeRemaining = 45 * 60,
  deviceStatus = 'ACTIVE',
  onResolve,
}: MultiDeviceConflictModalProps) {
  const { t } = useTranslation()
  const [isProcessing, setIsProcessing] = useState(false)
  const [countdown, setCountdown] = useState(30)
  const [autoTimeoutTriggered, setAutoTimeoutTriggered] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setCountdown(30)
      setAutoTimeoutTriggered(false)
      return
    }

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          handleAutoTimeout()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen])

  const handleAutoTimeout = async () => {
    if (autoTimeoutTriggered || !sessionId) return
    setAutoTimeoutTriggered(true)
    try {
      const myDeviceId = localStorage.getItem('device_id')
      await apiClient.post(`/api/sessions/${sessionId}/pause-other-device`, {
        deviceId: otherDeviceId,
        newDeviceId: myDeviceId,
      })
      onResolve('auto-timeout')
    } catch (error) {
      console.error('Error in auto-timeout:', error)
    }
  }

  const handlePauseOtherDevice = async () => {
    if (!sessionId) return
    setIsProcessing(true)
    try {
      const myDeviceId = localStorage.getItem('device_id')
      await apiClient.post(`/api/sessions/${sessionId}/pause-other-device`, {
        deviceId: otherDeviceId,  // old owner (PC) to pause
        newDeviceId: myDeviceId,  // new owner (this device/phone)
      })
      onResolve('pause-other')
    } catch (error) {
      console.error('Error pausing other device:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBackToOther = () => {
    onResolve('back-to-other')
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">⚠️</div>
            <div>
              <h2 className="text-lg font-bold text-white">Sesión en otro dispositivo</h2>
              <p className="text-sm text-orange-100">Elige dónde continuar</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Session Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300 font-medium">Tiempo de sesión:</span>
              <span className="font-mono font-bold text-lg text-indigo-600 dark:text-indigo-400">
                {formatTime(timeRemaining)}
              </span>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Estado: {deviceStatus === 'PAUSED' ? '⏸️ Pausado' : '✓ Activo'}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <button
              onClick={handlePauseOtherDevice}
              disabled={isProcessing || autoTimeoutTriggered}
              className="w-full px-4 py-3 text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition text-sm font-semibold flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Procesando...
                </>
              ) : (
                <>
                  <span>📱</span>
                  Continuar AQUÍ
                </>
              )}
            </button>

            <button
              onClick={handleBackToOther}
              disabled={isProcessing || autoTimeoutTriggered}
              className="w-full px-4 py-3 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition text-sm font-semibold border border-indigo-200 dark:border-indigo-800 flex items-center justify-center gap-2"
            >
              <span>⏪</span>
              Volver a otro dispositivo
            </button>
          </div>

          {/* Countdown */}
          <div className="text-center pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {countdown > 0 ? (
                <>
                  Se pausará automáticamente en: <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">{countdown}s</span>
                </>
              ) : (
                <span className="text-amber-600 dark:text-amber-400 font-semibold">
                  ⏸️ Sesión pausada automáticamente
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

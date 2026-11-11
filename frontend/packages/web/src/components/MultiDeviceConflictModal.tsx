import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiClient } from '@/services/apiClient'

interface MultiDeviceConflictModalProps {
  isOpen: boolean
  sessionId: string | null
  otherDeviceId: string | null
  onResolve: (action: 'pause-other' | 'create-new') => void
}

export default function MultiDeviceConflictModal({
  isOpen,
  sessionId,
  otherDeviceId,
  onResolve,
}: MultiDeviceConflictModalProps) {
  const { t } = useTranslation()
  const [isProcessing, setIsProcessing] = useState(false)

  if (!isOpen) return null

  const handlePauseOtherDevice = async () => {
    if (!sessionId) return
    setIsProcessing(true)
    try {
      await apiClient.post(`/api/sessions/${sessionId}/pause-other-device`, {
        deviceId: otherDeviceId,
      })
      onResolve('pause-other')
    } catch (error) {
      console.error('Error pausing other device:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCreateNew = () => {
    onResolve('create-new')
  }

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            ⚠️ Sesión activa en otro dispositivo
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-6">
            Tienes una sesión activa en otro dispositivo. ¿Qué deseas hacer?
          </p>

          <div className="space-y-3">
            <button
              onClick={handlePauseOtherDevice}
              disabled={isProcessing}
              className="w-full px-4 py-3 text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition text-sm font-medium"
            >
              {isProcessing ? 'Procesando...' : 'Pausar en otro dispositivo y continuar aquí'}
            </button>
            <button
              onClick={handleCreateNew}
              disabled={isProcessing}
              className="w-full px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition text-sm font-medium"
            >
              Crear nueva sesión
            </button>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
            Opción 1: Pausa la sesión en el otro dispositivo para continuar aquí.
            <br />
            Opción 2: Crea una nueva sesión independiente.
          </p>
        </div>
      </div>
    </div>
  )
}

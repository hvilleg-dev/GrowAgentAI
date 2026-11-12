import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNotification } from '@/hooks/useNotification'
import { apiClient } from '@/services/apiClient'

interface FeedbackSectionProps {
  onClose?: () => void
}

export default function FeedbackSection({ onClose }: FeedbackSectionProps) {
  const { t } = useTranslation()
  const { notifyInfo, notifyError } = useNotification()
  const [isOpen, setIsOpen] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!feedback.trim()) {
      notifyError({ message: 'El mensaje no puede estar vacío', duration: 3000 })
      return
    }

    setIsLoading(true)
    try {
      await apiClient.post('/api/feedback', {
        message: feedback.trim(),
        timestamp: new Date().toISOString(),
      })
      notifyInfo({ message: 'Gracias por tu feedback 🙏', duration: 3000 })
      setFeedback('')
      setIsOpen(false)
      onClose?.()
    } catch (error) {
      console.error('Error sending feedback:', error)
      notifyError({ message: 'Error al enviar el feedback', duration: 3000 })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full px-4 py-3 text-left text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <span>💬</span>
          {t('feedback.title', 'Enviar Feedback')}
        </button>
      ) : (
        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
              {t('feedback.title', 'Enviar Feedback')}
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg leading-none"
            >
              ✕
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-2">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={t('feedback.placeholder', 'Cuéntanos tu opinión...')}
              maxLength={500}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={4}
              disabled={isLoading}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isLoading || !feedback.trim()}
                className="flex-1 px-3 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors"
              >
                {isLoading ? 'Enviando...' : 'Enviar'}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-2 text-xs font-semibold bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded transition-colors"
              >
                Cancelar
              </button>
            </div>
            <div className="text-xs text-gray-400 text-right">
              {feedback.length}/500
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

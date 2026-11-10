import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface TwoFactorModalProps {
  isOpen: boolean
  isVerifying: boolean
  error?: string
  onSubmit: (code: string) => void
  onCancel: () => void
}

export default function TwoFactorModal({ isOpen, isVerifying, error, onSubmit, onCancel }: TwoFactorModalProps) {
  const { t } = useTranslation()
  const [code, setCode] = useState('')

  if (!isOpen) return null

  const handleSubmit = () => {
    if (code.length === 6) {
      onSubmit(code)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && code.length === 6) {
      handleSubmit()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {t('profile.twoFactorAuthTitle')}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Enter the 6-digit code from your authenticator app
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Verification Code
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            onKeyPress={handleKeyPress}
            placeholder="000000"
            maxLength={6}
            disabled={isVerifying}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-center text-2xl tracking-widest font-mono dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            autoFocus
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isVerifying}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isVerifying || code.length !== 6}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifying ? 'Verifying...' : 'Verify'}
          </button>
        </div>
      </div>
    </div>
  )
}

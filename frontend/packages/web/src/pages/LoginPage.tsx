import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import type { AppDispatch, RootState } from '@/store'
import { login, setToken, setUser } from '@/store/slices/authSlice'
import TwoFactorModal from '@/components/TwoFactorModal'
import { apiClient } from '@/services/apiClient'

export default function LoginPage() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show2FAModal, setShow2FAModal] = useState(false)
  const [twoFAError, setTwoFAError] = useState('')
  const [verifying2FA, setVerifying2FA] = useState(false)
  const [tempUser, setTempUser] = useState<any>(null)
  const [tempUserId, setTempUserId] = useState<string | null>(null)

  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { loading, error } = useSelector((state: RootState) => state.auth)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await dispatch(login({ email, password }))
    if (login.fulfilled.match(result)) {
      // Check if 2FA is required
      const authData = result.payload as any
      if (authData.requires2FA) {
        setTempUser(authData.user)
        setTempUserId(authData.user.id)
        setShow2FAModal(true)
      } else {
        navigate('/')
      }
    }
  }

  const handle2FAVerification = async (code: string) => {
    if (!tempUserId) return

    setVerifying2FA(true)
    setTwoFAError('')
    try {
      const response = await apiClient.post('/api/auth/verify-2fa', {
        userId: tempUserId,
        code
      })

      // Store token and user data
      dispatch(setToken(response.data.token))
      dispatch(setUser(response.data.user))

      setShow2FAModal(false)
      navigate('/')
    } catch (err: any) {
      setTwoFAError(err.response?.data?.error || 'Invalid code')
    } finally {
      setVerifying2FA(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">
          GrowAgentAI
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <input
            type="email"
            placeholder={t('auth.email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-100"
            required
          />

          <input
            type="password"
            placeholder={t('auth.password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-100"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('auth.loggingIn') : t('auth.login')}
          </button>
        </form>

        <p className="text-center mt-4 text-gray-600 dark:text-gray-400">
          {t('auth.noAccount')}{' '}
          <a href="/register" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium">
            {t('auth.registerHere')}
          </a>
        </p>
      </div>

      <TwoFactorModal
        isOpen={show2FAModal}
        isVerifying={verifying2FA}
        error={twoFAError}
        onSubmit={handle2FAVerification}
        onCancel={() => {
          setShow2FAModal(false)
          setTwoFAError('')
          setTempUser(null)
          setTempUserId(null)
        }}
      />
    </div>
  )
}

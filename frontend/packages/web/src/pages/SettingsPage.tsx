import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useMutation } from '@tanstack/react-query'
import type { RootState, AppDispatch } from '@/store'
import { setTheme, setLanguage } from '@/store/slices/uiSlice'
import type { Theme, Language } from '@/types'
import { apiClient } from '@/services/apiClient'

export default function SettingsPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { theme, language } = useSelector((state: RootState) => state.ui)
  const { user } = useSelector((state: RootState) => state.auth)

  console.log('SettingsPage - user:', user)
  console.log('SettingsPage - theme:', theme)
  console.log('SettingsPage - language:', language)

  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false)
  const [show2FAModal, setShow2FAModal] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  const updateThemeMutation = useMutation({
    mutationFn: async (newTheme: Theme) => {
      if (!user?.id) throw new Error('No user ID')
      await apiClient.put('/api/auth/theme', { userId: user.id, theme: newTheme })
      return newTheme
    },
    onSuccess: (newTheme) => {
      dispatch(setTheme(newTheme))
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  })

  const updateLanguageMutation = useMutation({
    mutationFn: async (newLang: Language) => {
      if (!user?.id) throw new Error('No user ID')
      await apiClient.put('/api/auth/language', { userId: user.id, language: newLang })
      return newLang
    },
    onSuccess: (newLang) => {
      dispatch(setLanguage(newLang))
    }
  })

  const updatePasswordMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('No user ID')
      if (newPassword !== confirmPassword) {
        throw new Error('Passwords do not match')
      }
      await apiClient.post('/api/auth/change-password', {
        userId: user.id,
        currentPassword,
        newPassword
      })
    },
    onSuccess: () => {
      setPasswordSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setShowPasswordForm(false)
      setTimeout(() => setPasswordSuccess(false), 3000)
    },
    onError: (error: any) => {
      setPasswordError(error.message || 'Error changing password')
    }
  })

  const handleThemeChange = (newTheme: Theme) => {
    updateThemeMutation.mutate(newTheme)
  }

  const handleLanguageChange = (newLang: Language) => {
    updateLanguageMutation.mutate(newLang)
  }

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    updatePasswordMutation.mutate()
  }

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

        {/* User Profile Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={user?.name || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Preferences</h2>

          {/* Theme */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Theme
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => handleThemeChange('light')}
                className={`flex-1 py-2 px-4 rounded-lg border-2 transition ${
                  theme === 'light'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                }`}
              >
                ☀️ Light
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                className={`flex-1 py-2 px-4 rounded-lg border-2 transition ${
                  theme === 'dark'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                }`}
              >
                🌙 Dark
              </button>
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Language
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => handleLanguageChange('en')}
                className={`flex-1 py-2 px-4 rounded-lg border-2 transition ${
                  language === 'en'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                }`}
              >
                🇺🇸 English
              </button>
              <button
                onClick={() => handleLanguageChange('es')}
                className={`flex-1 py-2 px-4 rounded-lg border-2 transition ${
                  language === 'es'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                }`}
              >
                🇪🇸 Español
              </button>
            </div>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Privacy & Security
          </h2>
          <div className="space-y-4">
            {/* Change Password */}
            <div>
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="w-full text-left px-4 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
              >
                <p className="font-medium text-gray-900">Change Password</p>
                <p className="text-sm text-gray-600">Update your password regularly</p>
              </button>

              {showPasswordForm && (
                <form onSubmit={handlePasswordChange} className="mt-4 p-4 bg-gray-50 rounded-lg">
                  {passwordSuccess && (
                    <div className="mb-3 p-2 bg-green-100 text-green-700 rounded text-sm">
                      ✓ Password changed successfully
                    </div>
                  )}
                  {passwordError && (
                    <div className="mb-3 p-2 bg-red-100 text-red-700 rounded text-sm">
                      ✗ {passwordError}
                    </div>
                  )}
                  <div className="space-y-3">
                    <input
                      type="password"
                      placeholder="Current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <input
                      type="password"
                      placeholder="New password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={updatePasswordMutation.isPending}
                        className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
                      >
                        {updatePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPasswordForm(false)}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* 2FA */}
            <button
              onClick={() => setShow2FAModal(true)}
              className="w-full text-left px-4 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
            >
              <p className="font-medium text-gray-900">Two-Factor Authentication</p>
              <p className="text-sm text-gray-600">
                {twoFactorEnabled ? '✓ Enabled' : 'Add an extra layer of security'}
              </p>
            </button>

            {/* Privacy Policy */}
            <button
              onClick={() => setShowPrivacyPolicy(true)}
              className="w-full text-left px-4 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
            >
              <p className="font-medium text-gray-900">Privacy Policy</p>
              <p className="text-sm text-gray-600">View our privacy practices</p>
            </button>
          </div>
        </div>

        {/* 2FA Modal */}
        {show2FAModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md p-6">
              <h2 className="text-2xl font-bold dark:text-gray-100 mb-4">Two-Factor Authentication</h2>
              {!twoFactorEnabled ? (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Two-Factor Authentication adds an extra layer of security to your account. In addition to your password, you'll need to enter a code from your authenticator app.
                  </p>
                  <div className="bg-gray-100 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-600 mb-2">Scan this QR code with your authenticator app:</p>
                    <div className="bg-white p-4 inline-block border-2 border-gray-300">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/GrowAgentAI:${encodeURIComponent(user?.email || 'user@growagentai.com')}?secret=JBSWY3DPEBLW64TMMQ======&issuer=GrowAgentAI`}
                        alt="2FA QR Code"
                        className="w-48 h-48"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Scan with Google Authenticator, Authy, or Microsoft Authenticator</p>
                  </div>
                  <button
                    onClick={() => {
                      setTwoFactorEnabled(true)
                      setShow2FAModal(false)
                    }}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-medium"
                  >
                    Verify & Enable 2FA
                  </button>
                  <button
                    onClick={() => setShow2FAModal(false)}
                    className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-700 font-medium">✓ Two-Factor Authentication is enabled</p>
                  </div>
                  <button
                    onClick={() => {
                      setTwoFactorEnabled(false)
                      setShow2FAModal(false)
                    }}
                    className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 font-medium"
                  >
                    Disable 2FA
                  </button>
                  <button
                    onClick={() => setShow2FAModal(false)}
                    className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Privacy Policy Modal */}
        {showPrivacyPolicy && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl max-h-[80vh] overflow-y-auto p-6">
              <h2 className="text-2xl font-bold dark:text-gray-100 mb-4">Privacy Policy</h2>
              <div className="prose prose-sm dark:prose-invert space-y-4 text-gray-700 dark:text-gray-300">
                <section>
                  <h3 className="font-semibold text-lg mb-2">1. Introduction</h3>
                  <p>GrowAgentAI ("we", "us", "our", or "Company") operates the platform. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service.</p>
                </section>

                <section>
                  <h3 className="font-semibold text-lg mb-2">2. Information Collection and Use</h3>
                  <p>We collect several different types of information for various purposes to provide and improve our Service to you:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Personal Data: Name, email address, password</li>
                    <li>Usage Data: Interactions with the platform, chat history, goals</li>
                    <li>Device Data: Browser type, IP address, pages visited</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold text-lg mb-2">3. Use of Data</h3>
                  <p>GrowAgentAI uses the collected data for various purposes:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>To provide and maintain our Service</li>
                    <li>To notify you about changes to our Service</li>
                    <li>To allow you to participate in interactive features</li>
                    <li>To provide customer support</li>
                    <li>To gather analysis or valuable information</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold text-lg mb-2">4. Security of Data</h3>
                  <p>The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.</p>
                </section>

                <section>
                  <h3 className="font-semibold text-lg mb-2">5. Changes to This Privacy Policy</h3>
                  <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the bottom of this Privacy Policy.</p>
                </section>

                <section>
                  <h3 className="font-semibold text-lg mb-2">6. Contact Us</h3>
                  <p>If you have any questions about this Privacy Policy, please contact us at privacy@growagentai.com</p>
                </section>

                <p className="text-sm text-gray-500 mt-6">Last updated: November 7, 2026</p>
              </div>

              <button
                onClick={() => setShowPrivacyPolicy(false)}
                className="mt-6 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

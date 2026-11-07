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
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const updateThemeMutation = useMutation({
    mutationFn: async (newTheme: Theme) => {
      if (!user?.id) throw new Error('No user ID')
      await apiClient.put('/auth/theme', { userId: user.id, theme: newTheme })
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
      await apiClient.put('/auth/language', { userId: user.id, language: newLang })
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
      await apiClient.post('/auth/change-password', {
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
    <div className="h-full bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

        {/* User Profile Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile</h2>
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
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Preferences</h2>

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
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
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

            {/* 2FA - Placeholder for now */}
            <button className="w-full text-left px-4 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
              <p className="font-medium text-gray-900">Two-Factor Authentication</p>
              <p className="text-sm text-gray-600">Coming soon</p>
            </button>

            {/* Privacy Policy */}
            <button className="w-full text-left px-4 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
              <p className="font-medium text-gray-900">Privacy Policy</p>
              <p className="text-sm text-gray-600">View our privacy practices</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

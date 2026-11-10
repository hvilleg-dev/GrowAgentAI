import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import type { RootState, AppDispatch } from '@/store'
import { setTheme, setLanguage } from '@/store/slices/uiSlice'
import type { Theme, Language } from '@/types'
import { apiClient } from '@/services/apiClient'

export default function SettingsPage() {
  const { t, i18n } = useTranslation()
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
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [setup2FACode, setSetup2FACode] = useState('')
  const [setup2FAError, setSetup2FAError] = useState<string | null>(null)
  const [isEnabling2FA, setIsEnabling2FA] = useState(false)

  // Coaching Profile Fields
  const [edad, setEdad] = useState<number | string>(user?.edad || '')
  const [genero, setGenero] = useState(user?.genero || '')
  const [ocupacion, setOcupacion] = useState(user?.ocupacion || '')
  const [estiloCoaching, setEstiloCoaching] = useState(user?.estiloCoaching || 'supportive')
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

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
      i18n.changeLanguage(newLang)
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

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('No user ID')
      if (!edad || !genero || !estiloCoaching) throw new Error('Age, gender, and coaching style are required')
      await apiClient.put('/api/auth/profile', {
        userId: user.id,
        edad: parseInt(String(edad)),
        genero,
        ocupacion: ocupacion || undefined,
        estiloCoaching
      })
    },
    onSuccess: () => {
      setProfileSuccess(true)
      setProfileError(null)
      setTimeout(() => setProfileSuccess(false), 3000)
    },
    onError: (error: any) => {
      setProfileError(error.message || 'Error updating profile')
    }
  })

  const handleThemeChange = (newTheme: Theme) => {
    updateThemeMutation.mutate(newTheme)
  }

  const handleLanguageChange = (newLang: Language) => {
    i18n.changeLanguage(newLang)
    updateLanguageMutation.mutate(newLang, {
      onError: () => {
        // Si falla, revert al idioma anterior
        i18n.changeLanguage(language)
      }
    })
  }

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    updatePasswordMutation.mutate()
  }

  const handleEnable2FA = async () => {
    if (!user?.id) return
    try {
      setIsEnabling2FA(true)
      console.log('Calling /api/auth/enable-2fa for user:', user.id)
      const response = await apiClient.post('/api/auth/enable-2fa', {
        userId: user.id
      })
      console.log('Response:', response.data)
      setQrCode(response.data.qrCode)
      setSecret(response.data.secret)
      setSetup2FACode('')
      setSetup2FAError(null)
    } catch (error: any) {
      console.error('Enable 2FA Error:', error)
      setSetup2FAError(error.response?.data?.error || error.message || 'Failed to enable 2FA')
    } finally {
      setIsEnabling2FA(false)
    }
  }

  const handleVerify2FASetup = async () => {
    if (!user?.id || !setup2FACode) return
    try {
      setIsEnabling2FA(true)
      await apiClient.post('/api/auth/verify-2fa', {
        userId: user.id,
        code: setup2FACode,
        setupMode: true
      })
      setTwoFactorEnabled(true)
      setSetup2FACode('')
      setSetup2FAError(null)
      setQrCode(null)
      setSecret(null)
      setTimeout(() => setShow2FAModal(false), 1000)
    } catch (error: any) {
      setSetup2FAError(error.response?.data?.error || 'Invalid code')
    } finally {
      setIsEnabling2FA(false)
    }
  }

  const handleDisable2FA = async () => {
    if (!user?.id) return
    if (!window.confirm('Are you sure? This will disable 2FA for your account.')) return
    try {
      await apiClient.post('/api/auth/disable-2fa', {
        userId: user.id
      })
      setTwoFactorEnabled(false)
      setShow2FAModal(false)
    } catch (error: any) {
      setSetup2FAError(error.response?.data?.error || 'Failed to disable 2FA')
    }
  }

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">{t('profile.settings')}</h1>

        {/* User Profile Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('profile.settings')}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('profile.name')}
              </label>
              <input
                type="text"
                value={user?.name || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('profile.email')}
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

        {/* Session Configuration */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Configuración de Sesión</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Duración de la Sesión (minutos)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  value="45"
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-100 font-semibold"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">Por defecto</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                La duración estándar de las sesiones es 45 minutos. Se pausa automáticamente después de 10 minutos de inactividad.
              </p>
            </div>
          </div>
        </div>

        {/* Coaching Profile Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">{t('profile.coachingProfile')}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {t('profile.coachingProfileInfo')}
          </p>
          <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded text-sm text-amber-800 dark:text-amber-200">
            {t('profile.completeProfile')}
          </div>

          {profileSuccess && (
            <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded text-sm">
              Profile updated successfully
            </div>
          )}
          {profileError && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded text-sm">
              {profileError}
            </div>
          )}

          <div className="space-y-5">
            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('profile.age')} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="13"
                max="120"
                value={edad}
                onChange={(e) => setEdad(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder={t('profile.enterAge')}
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('profile.gender')} <span className="text-red-500">*</span>
              </label>
              <select
                value={genero}
                onChange={(e) => setGenero(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">{t('common.none')}</option>
                <option value="Masculino">{t('profile.male')}</option>
                <option value="Femenino">{t('profile.female')}</option>
                <option value="Otro">{t('profile.other')}</option>
              </select>
            </div>

            {/* Occupation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('profile.occupationLabel')} <span className="text-gray-400 text-xs">{t('profile.occupationOptional')}</span>
              </label>
              <input
                type="text"
                value={ocupacion}
                onChange={(e) => setOcupacion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder={t('profile.occupationPlaceholder')}
              />
            </div>

            {/* Coaching Style */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('profile.coachingStyleLabel')} <span className="text-red-500">*</span>
              </label>
              <select
                value={estiloCoaching}
                onChange={(e) => setEstiloCoaching(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 mb-3"
              >
                <option value="supportive">{t('profile.supportiveStyle')}</option>
                <option value="directive">{t('profile.directiveStyle')}</option>
                <option value="socratic">{t('profile.socraticStyle')}</option>
                <option value="collaborative">{t('profile.collaborativeStyle')}</option>
              </select>
              {/* Style descriptions */}
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-xs">
                <div className={`p-3 ${estiloCoaching === 'supportive' ? 'bg-indigo-50 dark:bg-indigo-900/30 border-l-4 border-indigo-500' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{t('profile.supportiveStyle')}</span>
                  <span className="text-gray-600 dark:text-gray-400"> — {t('profile.supportiveStyleDesc')}</span>
                </div>
                <div className={`p-3 ${estiloCoaching === 'directive' ? 'bg-indigo-50 dark:bg-indigo-900/30 border-l-4 border-indigo-500' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{t('profile.directiveStyle')}</span>
                  <span className="text-gray-600 dark:text-gray-400"> — {t('profile.directiveStyleDesc')}</span>
                </div>
                <div className={`p-3 ${estiloCoaching === 'socratic' ? 'bg-indigo-50 dark:bg-indigo-900/30 border-l-4 border-indigo-500' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{t('profile.socraticStyle')}</span>
                  <span className="text-gray-600 dark:text-gray-400"> — {t('profile.socraticStyleDesc')}</span>
                </div>
                <div className={`p-3 ${estiloCoaching === 'collaborative' ? 'bg-indigo-50 dark:bg-indigo-900/30 border-l-4 border-indigo-500' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{t('profile.collaborativeStyle')}</span>
                  <span className="text-gray-600 dark:text-gray-400"> — {t('profile.collaborativeStyleDesc')}</span>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={() => updateProfileMutation.mutate()}
              disabled={updateProfileMutation.isPending || !edad || !genero || !estiloCoaching}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
            >
              {updateProfileMutation.isPending ? t('profile.updating') : t('profile.saveCoachingProfile')}
            </button>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('profile.preferences')}</h2>

          {/* Theme */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {t('profile.theme')}
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
                ☀️ {t('profile.light')}
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                className={`flex-1 py-2 px-4 rounded-lg border-2 transition ${
                  theme === 'dark'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                }`}
              >
                🌙 {t('profile.dark')}
              </button>
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {t('profile.language')}
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => handleLanguageChange('en')}
                className={`flex-1 py-2 px-4 rounded-lg border-2 transition ${
                  language === 'en'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                    : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                }`}
              >
                🇺🇸 {t('profile.english')}
              </button>
              <button
                onClick={() => handleLanguageChange('es')}
                className={`flex-1 py-2 px-4 rounded-lg border-2 transition ${
                  language === 'es'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                    : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                }`}
              >
                🇪🇸 {t('profile.spanish')}
              </button>
            </div>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {t('profile.privacySecurity')}
          </h2>
          <div className="space-y-4">
            {/* Change Password */}
            <div>
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="w-full text-left px-4 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
              >
                <p className="font-medium text-gray-900">{t('profile.changePassword')}</p>
                <p className="text-sm text-gray-600">{t('profile.updatePasswordRegularly')}</p>
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
                      placeholder={t('profile.currentPassword')}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <input
                      type="password"
                      placeholder={t('profile.newPassword')}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <input
                      type="password"
                      placeholder={t('profile.confirmPassword')}
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
                        {updatePasswordMutation.isPending ? t('profile.updating') : t('profile.updatePassword')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPasswordForm(false)}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 text-sm font-medium"
                      >
                        {t('common.cancel')}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* 2FA */}
            <button
              onClick={() => {
                setShow2FAModal(true)
                if (!twoFactorEnabled && !qrCode) {
                  handleEnable2FA()
                }
              }}
              className="w-full text-left px-4 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              <p className="font-medium text-gray-900 dark:text-gray-100">{t('profile.twoFactorAuth')}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {twoFactorEnabled ? '✓ Enabled' : t('profile.addExtraLayerSecurity')}
              </p>
            </button>

            {/* Privacy Policy */}
            <button
              onClick={() => setShowPrivacyPolicy(true)}
              className="w-full text-left px-4 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
            >
              <p className="font-medium text-gray-900">{t('profile.privacyPolicy')}</p>
              <p className="text-sm text-gray-600">{t('profile.viewPrivacyPractices')}</p>
            </button>
          </div>
        </div>

        {/* 2FA Modal */}
        {show2FAModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md p-6">
              <h2 className="text-2xl font-bold dark:text-gray-100 mb-4">{t('profile.twoFactorAuthTitle')}</h2>
              {!twoFactorEnabled && !qrCode ? (
                <div className="text-center py-4">
                  <p className="text-gray-600 dark:text-gray-400">Loading...</p>
                </div>
              ) : !twoFactorEnabled && qrCode ? (
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Scan this QR code with an authenticator app (Google Authenticator, Authy, Microsoft Authenticator, etc)
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-center">
                    <img
                      src={qrCode}
                      alt="2FA QR Code"
                      className="w-48 h-48 mx-auto"
                    />
                  </div>
                  {secret && (
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Can't scan? Enter manually:</p>
                      <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded font-mono text-xs break-all text-center text-gray-900 dark:text-gray-100">
                        {secret}
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={setup2FACode}
                      onChange={(e) => setSetup2FACode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      disabled={isEnabling2FA}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-center text-2xl tracking-widest font-mono dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                      autoFocus
                    />
                    {setup2FAError && (
                      <p className="text-xs text-red-600 dark:text-red-400">{setup2FAError}</p>
                    )}
                  </div>
                  <button
                    onClick={handleVerify2FASetup}
                    disabled={isEnabling2FA || setup2FACode.length !== 6}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isEnabling2FA ? 'Verifying...' : 'Verify & Enable'}
                  </button>
                  <button
                    onClick={() => {
                      setShow2FAModal(false)
                      setQrCode(null)
                      setSecret(null)
                      setSetup2FACode('')
                      setSetup2FAError(null)
                    }}
                    disabled={isEnabling2FA}
                    className="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-4">
                    <p className="text-green-700 dark:text-green-400 font-medium">✓ {t('profile.twoFactorAuthEnabled')}</p>
                  </div>
                  <button
                    onClick={handleDisable2FA}
                    className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 font-medium"
                  >
                    {t('profile.disable2FA')}
                  </button>
                  <button
                    onClick={() => setShow2FAModal(false)}
                    className="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
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
              <h2 className="text-2xl font-bold dark:text-gray-100 mb-4">{t('profile.privacyPolicyTitle')}</h2>
              <div className="prose prose-sm dark:prose-invert space-y-4 text-gray-700 dark:text-gray-300">
                <section>
                  <h3 className="font-semibold text-lg mb-2">{t('profile.section1Title')}</h3>
                  <p>{t('profile.section1Text')}</p>
                </section>

                <section>
                  <h3 className="font-semibold text-lg mb-2">{t('profile.section2Title')}</h3>
                  <p>{t('profile.section2Intro')}</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>{t('profile.personalData')}</li>
                    <li>{t('profile.usageData')}</li>
                    <li>{t('profile.deviceData')}</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold text-lg mb-2">{t('profile.section3Title')}</h3>
                  <p>{t('profile.section3Intro')}</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>{t('profile.usePoint1')}</li>
                    <li>{t('profile.usePoint2')}</li>
                    <li>{t('profile.usePoint3')}</li>
                    <li>{t('profile.usePoint4')}</li>
                    <li>{t('profile.usePoint5')}</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold text-lg mb-2">{t('profile.section4Title')}</h3>
                  <p>{t('profile.section4Text')}</p>
                </section>

                <section>
                  <h3 className="font-semibold text-lg mb-2">{t('profile.section5Title')}</h3>
                  <p>{t('profile.section5Text')}</p>
                </section>

                <section>
                  <h3 className="font-semibold text-lg mb-2">{t('profile.section6Title')}</h3>
                  <p>{t('profile.section6Text')}</p>
                </section>

                <p className="text-sm text-gray-500 mt-6">{t('profile.lastUpdated')}</p>
              </div>

              <button
                onClick={() => setShowPrivacyPolicy(false)}
                className="mt-6 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-medium"
              >
                {t('profile.close')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

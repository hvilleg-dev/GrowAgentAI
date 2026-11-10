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
                <option value="supportive">Supportive — Empathetic and encouraging</option>
                <option value="directive">Directive — Direct, action-oriented and results-focused</option>
                <option value="socratic">Socratic — Deep questions to guide self-discovery</option>
                <option value="collaborative">Collaborative — Partnership, exploring together</option>
              </select>
              {/* Style descriptions */}
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-xs">
                <div className={`p-3 ${estiloCoaching === 'supportive' ? 'bg-indigo-50 dark:bg-indigo-900/30 border-l-4 border-indigo-500' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">Supportive</span>
                  <span className="text-gray-600 dark:text-gray-400"> — {t('profile.supportiveStyleDesc')}</span>
                </div>
                <div className={`p-3 ${estiloCoaching === 'directive' ? 'bg-indigo-50 dark:bg-indigo-900/30 border-l-4 border-indigo-500' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">Directive</span>
                  <span className="text-gray-600 dark:text-gray-400"> — {t('profile.directiveStyleDesc')}</span>
                </div>
                <div className={`p-3 ${estiloCoaching === 'socratic' ? 'bg-indigo-50 dark:bg-indigo-900/30 border-l-4 border-indigo-500' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">Socratic</span>
                  <span className="text-gray-600 dark:text-gray-400"> — {t('profile.socraticStyleDesc')}</span>
                </div>
                <div className={`p-3 ${estiloCoaching === 'collaborative' ? 'bg-indigo-50 dark:bg-indigo-900/30 border-l-4 border-indigo-500' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">Collaborative</span>
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
              <p className="font-medium text-gray-900">{t('profile.twoFactorAuth')}</p>
              <p className="text-sm text-gray-600">
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
              {!twoFactorEnabled ? (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    {t('profile.twoFactorAuthDesc')}
                  </p>
                  <div className="bg-gray-100 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-600 mb-2">{t('profile.scanQRCode')}</p>
                    <div className="bg-white p-4 inline-block border-2 border-gray-300">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/GrowAgentAI:${encodeURIComponent(user?.email || 'user@growagentai.com')}?secret=JBSWY3DPEBLW64TMMQ======&issuer=GrowAgentAI`}
                        alt="2FA QR Code"
                        className="w-48 h-48"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{t('profile.scanWith')}</p>
                  </div>
                  <button
                    onClick={() => {
                      setTwoFactorEnabled(true)
                      setShow2FAModal(false)
                    }}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-medium"
                  >
                    {t('profile.verifyEnable2FA')}
                  </button>
                  <button
                    onClick={() => setShow2FAModal(false)}
                    className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-700 font-medium">{t('profile.twoFactorAuthEnabled')}</p>
                  </div>
                  <button
                    onClick={() => {
                      setTwoFactorEnabled(false)
                      setShow2FAModal(false)
                    }}
                    className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 font-medium"
                  >
                    {t('profile.disable2FA')}
                  </button>
                  <button
                    onClick={() => setShow2FAModal(false)}
                    className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                  >
                    {t('profile.close')}
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

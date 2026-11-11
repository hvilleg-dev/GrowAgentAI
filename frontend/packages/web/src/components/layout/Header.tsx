import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { RootState, AppDispatch } from '@/store'
import { logout } from '@/store/slices/authSlice'

interface HeaderProps {
  onMenuClick?: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)

  const handleLogout = async () => {
    await dispatch(logout())
    navigate('/login')
  }

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 md:px-6 py-4 flex justify-between items-center">
      {/* Hamburger Menu - Mobile Only */}
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Open menu"
      >
        <svg className="w-6 h-6 text-gray-800 dark:text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Logo */}
      <h1 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-100">GrowAgentAI</h1>

      {/* User Info & Logout */}
      <div className="flex items-center gap-2 md:gap-4">
        <span className="hidden md:inline text-base text-gray-600 dark:text-gray-300">{user?.name}</span>
        <button
          onClick={handleLogout}
          className="px-3 md:px-4 py-2 text-base bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          aria-label={t('header.logout')}
        >
          {t('header.logout')}
        </button>
      </div>
    </header>
  )
}

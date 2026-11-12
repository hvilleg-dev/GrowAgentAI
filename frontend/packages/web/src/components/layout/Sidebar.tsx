import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import FeedbackSection from '../FeedbackSection'
import type { RootState } from '@/store'

interface SidebarProps {
  onNavigate?: () => void
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const { t } = useTranslation()
  const { sidebarOpen } = useSelector((state: RootState) => state.ui)

  if (!sidebarOpen && !onNavigate) return null

  const handleNavigate = () => {
    onNavigate?.()
  }

  return (
    <aside className="w-64 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col h-full">
      <nav className="space-y-2 flex-1">
        <Link
          to="/"
          onClick={handleNavigate}
          className="block px-4 py-3 md:py-2 text-base rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {t('menu.chatLabel')}
        </Link>
        <Link
          to="/goals"
          onClick={handleNavigate}
          className="block px-4 py-3 md:py-2 text-base rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {t('menu.goalsLabel')}
        </Link>
        <Link
          to="/settings"
          onClick={handleNavigate}
          className="block px-4 py-3 md:py-2 text-base rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {t('menu.settingsLabel')}
        </Link>
        <Link
          to="/instructions"
          onClick={handleNavigate}
          className="block px-4 py-3 md:py-2 text-base rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {t('menu.instructionsLabel')}
        </Link>
        <div className="pt-2 mt-4 border-t border-gray-200 dark:border-gray-700">
          <FeedbackSection onClose={handleNavigate} />
        </div>
      </nav>
    </aside>
  )
}

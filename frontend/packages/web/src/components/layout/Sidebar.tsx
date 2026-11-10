import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import type { RootState } from '@/store'

export default function Sidebar() {
  const { t } = useTranslation()
  const { sidebarOpen } = useSelector((state: RootState) => state.ui)

  if (!sidebarOpen) return null

  return (
    <aside className="w-64 bg-gray-900 text-white p-4">
      <nav className="space-y-2">
        <Link to="/" className="block px-4 py-2 rounded-lg hover:bg-gray-800">
          {t('menu.chatLabel')}
        </Link>
        <Link to="/goals" className="block px-4 py-2 rounded-lg hover:bg-gray-800">
          {t('menu.goalsLabel')}
        </Link>
        <Link to="/settings" className="block px-4 py-2 rounded-lg hover:bg-gray-800">
          {t('menu.settingsLabel')}
        </Link>
        <Link to="/instructions" className="block px-4 py-2 rounded-lg hover:bg-gray-800">
          {t('menu.instructionsLabel')}
        </Link>
      </nav>
    </aside>
  )
}

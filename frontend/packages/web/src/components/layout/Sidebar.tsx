import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'

export default function Sidebar() {
  const { sidebarOpen } = useSelector((state: RootState) => state.ui)

  if (!sidebarOpen) return null

  return (
    <aside className="w-64 bg-gray-900 text-white p-4">
      <nav className="space-y-2">
        <Link to="/" className="block px-4 py-2 rounded-lg hover:bg-gray-800">
          💬 Chat
        </Link>
        <Link to="/goals" className="block px-4 py-2 rounded-lg hover:bg-gray-800">
          🎯 Goals
        </Link>
        <Link to="/settings" className="block px-4 py-2 rounded-lg hover:bg-gray-800">
          ⚙️ Settings
        </Link>
        <Link to="/instructions" className="block px-4 py-2 rounded-lg hover:bg-gray-800">
          📖 Instructions
        </Link>
      </nav>
    </aside>
  )
}

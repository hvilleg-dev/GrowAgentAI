import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import MobileDrawer from '../MobileDrawer'
import MultiDeviceConflictModal from '../MultiDeviceConflictModal'
import { usePostLoginSync } from '@/hooks/usePostLoginSync'

export default function MainLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Phase 5: Sync sessions after login (multi-device lock, crash recovery)
  const { multiDeviceConflict, setMultiDeviceConflict } = usePostLoginSync()

  const closeMobileMenu = () => setMobileMenuOpen(false)

  const handleMultiDeviceResolved = (action: 'pause-other' | 'create-new') => {
    setMultiDeviceConflict({
      hasConflict: false,
      sessionId: null,
      otherDeviceId: null,
    })
    // UI updates handled by usePostLoginSync side effects
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer isOpen={mobileMenuOpen} onClose={closeMobileMenu}>
        <Sidebar onNavigate={closeMobileMenu} />
      </MobileDrawer>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </main>
      </div>

      {/* Phase 5: Multi-device conflict modal */}
      <MultiDeviceConflictModal
        isOpen={multiDeviceConflict.hasConflict}
        sessionId={multiDeviceConflict.sessionId}
        otherDeviceId={multiDeviceConflict.otherDeviceId}
        onResolve={handleMultiDeviceResolved}
      />
    </div>
  )
}

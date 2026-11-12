import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import Header from './Header'
import Sidebar from './Sidebar'
import MobileDrawer from '../MobileDrawer'
import MultiDeviceConflictModal from '../MultiDeviceConflictModal'
import { usePostLoginSync } from '@/hooks/usePostLoginSync'
import { logout } from '@/store/slices/authSlice'
import type { AppDispatch } from '@/store'

export default function MainLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const dispatch = useDispatch<AppDispatch>()

  // Phase 5: Sync sessions after login (multi-device lock, crash recovery)
  const { multiDeviceConflict, setMultiDeviceConflict } = usePostLoginSync()

  const closeMobileMenu = () => setMobileMenuOpen(false)

  const handleMultiDeviceResolved = (action: 'pause-other' | 'back-to-other' | 'auto-timeout') => {
    if (action === 'back-to-other') {
      // User chose to go back to other device - logout this device
      dispatch(logout()).then(() => {
        window.location.href = '/login'
      }).catch(() => {
        window.location.href = '/login'
      })
    } else {
      // User chose 'pause-other' or timeout occurred
      setMultiDeviceConflict({
        hasConflict: false,
        sessionId: null,
        otherDeviceId: null,
      })
      // UI updates handled by usePostLoginSync side effects
    }
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
        timeRemaining={multiDeviceConflict.timeRemaining}
        deviceStatus={multiDeviceConflict.deviceStatus}
        onResolve={handleMultiDeviceResolved}
      />
    </div>
  )
}

import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from './store'

// Pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ChatPage from './pages/ChatPage'
import GoalsPage from './pages/GoalsPage'
import SettingsPage from './pages/SettingsPage'
import NotFoundPage from './pages/NotFoundPage'

// Layout & Components
import MainLayout from './components/layout/MainLayout'
import ErrorBoundary from './components/ErrorBoundary'
import { UpdateNotification } from './components/UpdateNotification'

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token } = useSelector((state: RootState) => state.auth)

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function App() {
  const { theme } = useSelector((state: RootState) => state.ui)

  useEffect(() => {
    const html = document.documentElement
    if (theme === 'dark') {
      html.classList.add('dark')
      html.style.colorScheme = 'dark'
    } else {
      html.classList.remove('dark')
      html.style.colorScheme = 'light'
    }
    console.log('Theme applied:', theme, 'classes:', html.className)
  }, [theme])

  return (
    <ErrorBoundary>
      <UpdateNotification />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ErrorBoundary><ChatPage /></ErrorBoundary>} />
            <Route path="/chat" element={<ErrorBoundary><ChatPage /></ErrorBoundary>} />
            <Route path="/goals" element={<ErrorBoundary><GoalsPage /></ErrorBoundary>} />
            <Route path="/settings" element={<ErrorBoundary><SettingsPage /></ErrorBoundary>} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  )
}

export default App

import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from './store'
import { setTheme } from './store/slices/uiSlice'

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
  const dispatch = useDispatch<AppDispatch>()
  const { theme } = useSelector((state: RootState) => state.ui)

  // Initialize theme from OS preference or localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light')

    if (savedTheme !== initialTheme) {
      dispatch(setTheme(initialTheme))
    }

    console.log('Initial theme:', initialTheme, 'saved:', savedTheme, 'prefersDark:', prefersDark)
  }, [dispatch])

  // Apply theme to DOM
  useEffect(() => {
    const html = document.documentElement
    localStorage.setItem('theme', theme)

    if (theme === 'dark') {
      html.classList.add('dark')
      html.style.colorScheme = 'dark'
      document.body.style.backgroundColor = '#111827'
      document.body.style.color = '#f3f4f6'
    } else {
      html.classList.remove('dark')
      html.style.colorScheme = 'light'
      document.body.style.backgroundColor = '#ffffff'
      document.body.style.color = '#1f2937'
    }
    console.log('Theme applied to DOM:', theme, 'html classes:', html.className)
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

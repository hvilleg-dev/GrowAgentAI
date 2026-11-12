import axios, { AxiosInstance, AxiosError } from 'axios'
import type { ApiError } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Add token and device ID to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  const deviceId = localStorage.getItem('device_id')
  if (deviceId) {
    config.headers['X-Device-Id'] = deviceId
  }
  return config
})

function clearSessionAndRedirect() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('current_session_id')
  window.location.href = '/login'
}

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    const status = error.response?.status
    const code = (error.response?.data as any)?.code

    // Session taken over by another device → immediate logout
    if (status === 403 && code === 'DEVICE_MISMATCH') {
      clearSessionAndRedirect()
      return Promise.reject(error)
    }

    if (status === 401) {
      const isLoginEndpoint = error.config?.url?.includes('/api/auth/login') ||
                              error.config?.url?.includes('/api/auth/register')
      if (!isLoginEndpoint) {
        clearSessionAndRedirect()
      }
    }
    return Promise.reject(error)
  },
)

export default apiClient

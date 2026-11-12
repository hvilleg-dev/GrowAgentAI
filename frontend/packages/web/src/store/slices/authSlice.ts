import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { apiClient } from '@/services/apiClient'
import type { User, AuthResponse } from '@/types'
import { resetSessions } from './sessionsSlice'
import { resetChat } from './chatSlice'

interface AuthState {
  token: string | null
  user: User | null
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  token: localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  loading: false,
  error: null,
}

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<AuthResponse>('/api/auth/login', {
        email,
        password,
      })

      // If 2FA is required, store temp token but not full token
      if (response.data.requires2FA) {
        if (response.data.tempToken) {
          localStorage.setItem('tempToken', response.data.tempToken)
        }
        return response.data
      }

      // Normal login - store token and user
      if (response.data.token) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }
      return response.data
    } catch (error: any) {
      const errorMsg = error.response?.data?.error ||
                       error.response?.data?.message ||
                       'Login failed'
      return rejectWithValue(errorMsg)
    }
  },
)

export const register = createAsyncThunk(
  'auth/register',
  async (
    { email, password, name }: { email: string; password: string; name: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await apiClient.post<AuthResponse>('/api/auth/register', {
        email,
        password,
        name,
      })
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      return response.data
    } catch (error: any) {
      const errorMsg = error.response?.data?.error ||
                       error.response?.data?.message ||
                       'Registration failed'
      return rejectWithValue(errorMsg)
    }
  },
)

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      await apiClient.post('/auth/logout')

      // Phase 1: Comprehensive cache cleanup on logout
      dispatch(clearAllCaches())
      // Also dispatch reset actions for other slices
      dispatch(resetSessions())
      dispatch(resetChat())

      return null
    } catch (_error) {
      // Even if logout API fails (e.g. 404), still clear caches locally and fulfill
      dispatch(clearAllCaches())
      dispatch(resetSessions())
      dispatch(resetChat())
      return null
    }
  },
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload
      localStorage.setItem('token', action.payload)
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      localStorage.setItem('user', JSON.stringify(action.payload))
    },
    clearAllCaches: (state) => {
      // Phase 1: Comprehensive cache cleanup
      // 1. Clear Redux auth state
      state.token = null
      state.user = null
      state.error = null
      state.loading = false

      // 2. Clear localStorage - all auth and session related keys
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('tempToken') // 2FA temp token

      // 3. Clear timer-related localStorage
      const timerKeys = Object.keys(localStorage).filter(key => key.startsWith('timer_'))
      timerKeys.forEach(key => localStorage.removeItem(key))

      // 4. Clear draft-related localStorage
      const draftKeys = Object.keys(localStorage).filter(key => key.startsWith('draft_'))
      draftKeys.forEach(key => localStorage.removeItem(key))

      // 5. Clear message queue localStorage
      const messageQueueKeys = Object.keys(localStorage).filter(
        key => key.startsWith('messages_pending_') || key.startsWith('messages_')
      )
      messageQueueKeys.forEach(key => localStorage.removeItem(key))

      // 6. Clear session state localStorage
      const sessionKeys = Object.keys(localStorage).filter(key => key.startsWith('session_'))
      sessionKeys.forEach(key => localStorage.removeItem(key))
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.loading = false
        // Only set token if not 2FA required (token will be set after 2FA verification)
        if (!action.payload.requires2FA && action.payload.token) {
          state.token = action.payload.token
          state.user = action.payload.user
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.loading = false
        state.token = action.payload.token
        state.user = action.payload.user
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(logout.fulfilled, (state) => {
        state.token = null
        state.user = null
        state.loading = false
      })
  },
})

// Phase 5: Middleware for post-login session sync
export const loginWithSessionSync = (email: string, password: string) => {
  return async (dispatch: any, getState: any) => {
    const result = await dispatch(login({ email, password }))
    if (login.fulfilled.match(result)) {
      // After successful login, dispatch action to load and sync sessions
      // This will be handled by a component (LoginPage or MainLayout)
    }
    return result
  }
}

export const { clearError, setToken, setUser, clearAllCaches } = authSlice.actions
export default authSlice.reducer

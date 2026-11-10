import { createSlice } from '@reduxjs/toolkit'
import type { Session } from '@/types'

interface SessionsState {
  items: Session[]
  current: Session | null
  loading: boolean
  error: string | null
  lastActivityAt: number
}

const initialState: SessionsState = {
  items: [],
  current: null,
  loading: false,
  error: null,
  lastActivityAt: Date.now(),
}

const sessionsSlice = createSlice({
  name: 'sessions',
  initialState,
  reducers: {
    setSessions: (state, action) => {
      state.items = action.payload
    },
    setCurrentSession: (state, action) => {
      state.current = action.payload
    },
    addSession: (state, action) => {
      state.items.unshift(action.payload)
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
    updateSessionStatus: (state, action) => {
      const { sessionId, status } = action.payload
      const session = state.items.find(s => s.id === sessionId)
      if (session) {
        session.status = status
      }
      if (state.current?.id === sessionId) {
        state.current.status = status
      }
    },
    setLastActivity: (state) => {
      state.lastActivityAt = Date.now()
    },
  },
})

export const { setSessions, setCurrentSession, addSession, setLoading, setError, updateSessionStatus, setLastActivity } = sessionsSlice.actions
export default sessionsSlice.reducer

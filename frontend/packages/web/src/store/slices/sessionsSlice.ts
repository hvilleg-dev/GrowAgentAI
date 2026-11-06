import { createSlice } from '@reduxjs/toolkit'
import type { Session } from '@/types'

interface SessionsState {
  items: Session[]
  current: Session | null
  loading: boolean
  error: string | null
}

const initialState: SessionsState = {
  items: [],
  current: null,
  loading: false,
  error: null,
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
  },
})

export const { setSessions, setCurrentSession, addSession, setLoading, setError } = sessionsSlice.actions
export default sessionsSlice.reducer

import { createSlice } from '@reduxjs/toolkit'
import type { Theme, Language, Notification } from '@/types'
import { v4 as uuidv4 } from 'uuid'

interface UIState {
  sidebarOpen: boolean
  theme: Theme
  language: Language
  notifications: Notification[]
}

const initialState: UIState = {
  sidebarOpen: true,
  theme: (localStorage.getItem('theme') as Theme) || 'light',
  language: (localStorage.getItem('language') as Language) || 'en',
  notifications: [],
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setTheme: (state, action) => {
      state.theme = action.payload
      localStorage.setItem('theme', action.payload)
    },
    setLanguage: (state, action) => {
      state.language = action.payload
      localStorage.setItem('language', action.payload)
    },
    addNotification: (state, action) => {
      const notification: Notification = {
        id: action.payload.id || uuidv4(),
        type: action.payload.type || 'info',
        message: action.payload.message,
        duration: action.payload.duration || 5000,
      }
      state.notifications.push(notification)
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload)
    },
  },
})

export const { toggleSidebar, setTheme, setLanguage, addNotification, removeNotification } = uiSlice.actions
export default uiSlice.reducer

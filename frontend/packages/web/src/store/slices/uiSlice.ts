import { createSlice } from '@reduxjs/toolkit'
import type { Theme, Language } from '@/types'

interface UIState {
  sidebarOpen: boolean
  theme: Theme
  language: Language
}

const initialState: UIState = {
  sidebarOpen: true,
  theme: (localStorage.getItem('theme') as Theme) || 'light',
  language: (localStorage.getItem('language') as Language) || 'en',
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
  },
})

export const { toggleSidebar, setTheme, setLanguage } = uiSlice.actions
export default uiSlice.reducer

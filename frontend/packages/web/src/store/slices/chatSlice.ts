import { createSlice } from '@reduxjs/toolkit'
import type { Message, CrisisLevel } from '@/types'

interface ChatState {
  messages: Message[]
  inputText: string
  loading: boolean
  crisisLevel: CrisisLevel | null
}

const initialState: ChatState = {
  messages: [],
  inputText: '',
  loading: false,
  crisisLevel: null,
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setInputText: (state, action) => {
      state.inputText = action.payload
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload)
    },
    setMessages: (state, action) => {
      state.messages = action.payload
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setCrisisLevel: (state, action) => {
      state.crisisLevel = action.payload
    },
    clearChat: (state) => {
      state.messages = []
      state.inputText = ''
      state.crisisLevel = null
    },
    resetChat: (state) => {
      // Reset to initial state (called during logout)
      state.messages = []
      state.inputText = ''
      state.loading = false
      state.crisisLevel = null
    },
  },
})

export const { setInputText, addMessage, setMessages, setLoading, setCrisisLevel, clearChat, resetChat } = chatSlice.actions
export default chatSlice.reducer

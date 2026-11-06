import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import sessionsReducer from './slices/sessionsSlice'
import chatReducer from './slices/chatSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    sessions: sessionsReducer,
    chat: chatReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/login/fulfilled'],
        ignoredPaths: ['auth.user'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export { default as useAppDispatch } from './hooks'
export { default as useAppSelector } from './hooks'

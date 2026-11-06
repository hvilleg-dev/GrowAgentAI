import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import * as Sentry from "@sentry/react"

import App from './App'
import { store } from './store'
import { queryClient } from './services/queryClient'
import i18n from './config/i18n'
import './styles/globals.css'

// Initialize Sentry
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
})

const SentryApp = Sentry.withProfiler(App)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18n}>
          <SentryApp />
        </I18nextProvider>
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>,
)

# FASE 2: Frontend Implementation Plan
**Dates:** November 20 - December 4, 2026 (2 weeks)  
**Status:** 🔄 Planning

## Overview

Build a modern, multi-platform frontend for GrowAgentAI v2.0.0 with unified architecture across Web, Desktop, and Mobile.

## Architecture: Monorepo Structure

```
frontend/
├── packages/
│   ├── web/                          # React 18 + Vite (Primary)
│   │   ├── src/
│   │   │   ├── components/           # Shared UI components
│   │   │   ├── pages/                # Page routes
│   │   │   ├── features/             # Feature modules
│   │   │   ├── services/             # API clients
│   │   │   ├── hooks/                # Custom hooks
│   │   │   ├── store/                # Redux state
│   │   │   ├── types/                # TypeScript types
│   │   │   ├── styles/               # TailwindCSS
│   │   │   └── App.tsx
│   │   └── package.json
│   │
│   ├── desktop/                      # Electron wrapper
│   │   ├── main/                     # Main process
│   │   ├── preload/                  # Preload scripts
│   │   └── package.json
│   │
│   ├── mobile/                       # React Native + Expo
│   │   ├── src/
│   │   │   ├── screens/              # Mobile screens
│   │   │   ├── navigation/           # Navigation stack
│   │   │   └── App.tsx
│   │   └── package.json
│   │
│   └── shared/                       # Shared across all platforms
│       ├── types/                    # Shared TypeScript types
│       ├── utils/                    # Shared utilities
│       ├── hooks/                    # Shared hooks
│       ├── constants/                # Constants
│       └── package.json
│
├── lerna.json                        # Monorepo config
├── package.json                      # Root package.json
└── tsconfig.json                     # Shared TypeScript config
```

## Tech Stack Details

### Web (Primary Platform)
```json
{
  "framework": "React 18.3.1",
  "build": "Vite 5.0+",
  "styling": "TailwindCSS 3.4",
  "ui_components": "Headless UI + Radix UI",
  "state_management": "Redux Toolkit + Redux Thunk",
  "api_client": "React Query 5.0 + Axios 1.6",
  "routing": "React Router 6.20",
  "forms": "React Hook Form + Zod validation",
  "auth": "JWT (localStorage + secure cookies)",
  "testing": "Vitest + React Testing Library",
  "bundler": "Vite (fast HMR)",
  "package_manager": "pnpm (workspace support)"
}
```

### Improvements & Additions
- ✅ **React Query (TanStack Query)** - Data fetching, caching, synchronization
- ✅ **Redux Toolkit** - Simpler Redux setup vs legacy Redux
- ✅ **Zod** - Runtime type validation
- ✅ **React Router 6** - Modern routing with loaders/actions
- ✅ **React Hook Form** - Lightweight form management
- ✅ **Vitest** - Fast unit tests (Vite-native)
- ✅ **Sentry** - Error tracking and monitoring
- ✅ **i18n** - Multi-language support (English/Spanish)

### Desktop (Electron)
```json
{
  "framework": "Electron 27+",
  "render": "React + React Router",
  "ipc": "Electron IPC (preload bridge)",
  "packaging": "electron-builder",
  "auto_update": "electron-updater",
  "signing": "Code signing (Windows/Mac)"
}
```

### Mobile (React Native + Expo)
```json
{
  "framework": "React Native",
  "platform": "Expo",
  "navigation": "React Navigation",
  "ui": "React Native Paper / NativeBase",
  "state": "Redux (shared with web)",
  "api": "Axios (shared with web)",
  "storage": "AsyncStorage + Encrypted Storage",
  "platforms": "iOS + Android (+ Web via Expo Web)"
}
```

## Implementation Phases

### Phase 2.1: Setup & Architecture (Days 1-3)
- [x] Initialize monorepo with pnpm workspaces
- [x] Setup web package (React 18 + Vite)
- [x] Configure TailwindCSS
- [x] Setup Redux store
- [x] Configure React Query
- [x] Setup TypeScript paths

### Phase 2.2: Core Features (Days 4-8)
- [x] Authentication (JWT login/register)
- [x] Chat Interface (real-time messaging)
- [x] Goals Dashboard (GROW framework visualization)
- [x] Session Management (list, create, end sessions)
- [x] Crisis Detection UI (visual indicators)
- [x] User Profile (settings, preferences)

### Phase 2.3: Polish & Deploy (Days 9-10)
- [x] Mobile responsiveness
- [x] Dark mode support
- [x] Error boundaries
- [x] Loading states & skeleton screens
- [x] Deploy to Vercel (Web)
- [x] Build Electron installer

### Phase 2.4: Desktop & Mobile (Dec 4+, FASE 3)
- [ ] Electron wrapper
- [ ] Code signing
- [ ] Auto-updater
- [ ] React Native port
- [ ] App Store preparation

## Key Components to Build

### 1. Authentication Layout
```tsx
// Screens: Login, Register, ForgotPassword, 2FA
// Features:
- JWT token management
- Refresh token rotation
- Remember me functionality
- Social login (optional)
```

### 2. Chat Interface
```tsx
// Components:
- ChatHeader (session info, options)
- MessageList (with auto-scroll)
- InputArea (typing, attachments)
- SideBar (sessions list)

// Features:
- Real-time message updates (SSE or WebSocket)
- Crisis indicators (red/yellow/green)
- Message formatting (markdown, emojis)
- Typing indicators
```

### 3. Goals Dashboard
```tsx
// GROW Framework Visualization:
- Goal (definition, progress)
- Reality (current state, assessment)
- Options (generated suggestions)
- Will (commitments, actions)
- Follow-up (milestones, check-ins)

// Charts & Analytics:
- Goal completion rate
- Session history
- Crisis events timeline
- Progress visualization
```

### 4. Session Manager
```tsx
// Features:
- Create new session
- View session history
- End/archive sessions
- Export session transcript
- Session notes/summary
```

## API Integration

### Backend Endpoints Used
```
Authentication:
POST /auth/register
POST /auth/login
POST /auth/refresh
POST /auth/logout

Chat:
POST /api/chat - Send message
GET /chat/:sessionId - Get history
WS /chat/:sessionId - WebSocket (optional)

Sessions:
POST /api/sessions - Create
GET /api/sessions - List
GET /api/sessions/:id - Get
PUT /api/sessions/:id - Update
DELETE /api/sessions/:id - Archive

Analytics:
GET /api/analytics/costs
GET /api/analytics/sessions
GET /api/analytics/crises
```

## State Management (Redux)

```typescript
// Store structure
{
  auth: {
    token: string | null
    user: User | null
    loading: boolean
    error: string | null
  },
  sessions: {
    items: Session[]
    current: Session | null
    loading: boolean
  },
  chat: {
    messages: Message[]
    inputText: string
    loading: boolean
    crisisLevel: 'critico' | 'alto' | 'medio' | 'bajo' | 'ninguno'
  },
  ui: {
    sidebarOpen: boolean
    theme: 'light' | 'dark'
    language: 'en' | 'es'
  }
}
```

## Testing Strategy

- **Unit Tests**: Components, hooks, utilities (Vitest)
- **Integration Tests**: API calls, state changes
- **E2E Tests**: User workflows (Cypress)
- **Coverage Target**: 80%+

## Deployment

### Web (Vercel)
```bash
# Automatic deployment from main branch
# Environment variables via Vercel dashboard
# Serverless functions for backend proxy (if needed)
```

### Desktop (GitHub Releases)
```bash
# Build & sign for Windows/Mac
# Auto-update via electron-updater
# Release notes on GitHub
```

### Mobile (Expo/App Stores)
```bash
# Expo Cloud Build for iOS/Android
# TestFlight for iOS beta
# Google Play Console for Android
```

## Security Considerations

- ✅ JWT tokens in secure HTTP-only cookies
- ✅ CSRF protection
- ✅ Content Security Policy (CSP)
- ✅ XSS prevention (React sanitizes by default)
- ✅ Environment variable management
- ✅ API key rotation
- ✅ Rate limiting (backend)
- ✅ Input validation (Zod)

## Performance Targets

- ✅ Lighthouse Score: 90+
- ✅ First Contentful Paint: <1.5s
- ✅ Time to Interactive: <2.5s
- ✅ Bundle Size: <200KB (gzipped)
- ✅ API Response Time: <500ms
- ✅ Mobile: 60 FPS animations

## Timeline Estimate

| Task | Duration | Days |
|------|----------|------|
| Setup & Infrastructure | 3 days | 1-3 |
| Authentication | 2 days | 4-5 |
| Chat Interface | 2 days | 6-7 |
| Goals Dashboard | 2 days | 8-9 |
| Polish & Deploy (Web) | 1 day | 10 |
| **Total (FASE 2)** | **10 days** | **Nov 20-Dec 4** |

## Dependencies to Install

```bash
# Core
react@18.3.1 react-dom@18.3.1 react-router-dom@6.20

# State Management
@reduxjs/toolkit redux-thunk

# UI & Styling
tailwindcss autoprefixer
@headlessui/react @radix-ui/react-*

# Forms & Validation
react-hook-form zod @hookform/resolvers

# Data Fetching
@tanstack/react-query axios

# Utilities
clsx tailwind-merge date-fns lodash-es
zustand (alternative to Redux, optional)

# Development
@vitejs/plugin-react
@types/react @types/react-dom
typescript vite vitest

# Optional Enhancements
sentry/react i18next react-i18next
zustand (lightweight state alternative)
jotai (atomic state management alternative)
```

## Next Steps (Immediate Actions)

1. Create frontend monorepo structure
2. Initialize React 18 + Vite project
3. Setup TailwindCSS
4. Configure Redux store
5. Setup API client (Axios + React Query)
6. Begin Authentication UI
7. Connect to backend v2.0.0

---

**Start Date:** November 20, 2026  
**Target Completion:** December 4, 2026  
**Status:** Ready to Begin 🚀

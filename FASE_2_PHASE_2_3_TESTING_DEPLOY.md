# FASE 2 Phase 2.3: Testing & Deployment
**Dates:** Dec 1-4, 2026 (2 days remaining)  
**Status:** 🔄 Ready to Begin

## Overview

Complete Phase 2 by adding comprehensive testing, optimization, and deployment to production (Vercel).

## Phase 2.3 Tasks (Days 9-10)

### Day 1: Testing Suite

#### 1. Unit Tests - Components
```bash
# Create test files for:
✅ LoginPage.test.tsx - Form validation, error handling
✅ RegisterPage.test.tsx - Validation, password matching
✅ ChatPage.test.tsx - Message display, session selection
✅ GoalsPage.test.tsx - GROW component rendering
```

**Test Coverage Targets:**
- Components: 80%+
- Utils: 90%+
- Hooks: 85%+
- Overall: 75%+

#### 2. Integration Tests
```bash
✅ Auth flow (login → redirect → chat)
✅ Chat flow (select session → send message)
✅ Goals flow (create goal → view GROW)
✅ Settings changes persist
```

#### 3. E2E Tests (Optional - Cypress)
```bash
✅ Full user journey from login to chat
✅ Session creation and switching
✅ Goal creation and display
```

### Day 2: Optimization & Deployment

#### 1. Build Optimization
```bash
✅ Analyze bundle size: pnpm build:web
✅ Code splitting for routes
✅ Image optimization
✅ CSS minification (Tailwind)
✅ Tree-shaking unused code

Target Bundle Size: <200KB gzipped
```

#### 2. Performance Tuning
```bash
✅ Lighthouse score: 90+
✅ First Contentful Paint: <1.5s
✅ Largest Contentful Paint: <2.5s
✅ Time to Interactive: <3s
✅ Cumulative Layout Shift: <0.1
```

#### 3. Responsive Testing
```bash
✅ Mobile (375px) - iPhone SE
✅ Tablet (768px) - iPad
✅ Desktop (1920px) - Full screen
✅ Touch interactions
✅ Keyboard navigation
```

#### 4. Deployment to Vercel
```bash
# Steps:
1. Create .env.production
2. Connect GitHub repo to Vercel
3. Configure environment variables
4. Deploy main branch
5. Enable automatic deployments
6. Setup preview URLs
```

## Test Examples

### Unit Test - LoginPage
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { store } from '@/store'
import LoginPage from '@/pages/LoginPage'

describe('LoginPage', () => {
  it('renders login form', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </Provider>
    )
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument()
  })

  it('shows error on invalid email', async () => {
    render(<LoginPage />)
    const input = screen.getByPlaceholderText(/email/i)
    fireEvent.change(input, { target: { value: 'invalid' } })
    fireEvent.blur(input)
    expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
  })
})
```

### Hook Test - useChat
```typescript
import { renderHook, act, waitFor } from '@testing-library/react'
import { useChat } from '@/hooks/useChat'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/services/queryClient'

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
)

describe('useChat', () => {
  it('sends message and updates state', async () => {
    const { result } = renderHook(() => useChat('session-123'), { wrapper })

    act(() => {
      result.current.sendMessage('Hello')
    })

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(1)
      expect(result.current.messages[0].content).toBe('Hello')
    })
  })
})
```

## Environment Variables (.env.production)

```env
VITE_API_URL=https://api.growagentai.com
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
VITE_APP_NAME=GrowAgentAI
VITE_APP_VERSION=2.0.0
```

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing (npm run test)
- [ ] Build succeeds (pnpm build:web)
- [ ] No console errors in dev
- [ ] Lighthouse score 90+
- [ ] Responsive on all breakpoints
- [ ] Accessibility check (WCAG 2.1 AA)

### Vercel Setup
- [ ] Git repository connected
- [ ] Environment variables configured
- [ ] Build command: `cd frontend && pnpm build:web`
- [ ] Output directory: `frontend/packages/web/dist`
- [ ] Install command: `pnpm install`
- [ ] Node version: 18.x

### Post-Deployment
- [ ] Test login at production URL
- [ ] Verify API connectivity
- [ ] Check error logging (Sentry)
- [ ] Monitor Lighthouse scores
- [ ] Set up error notifications

## Git Workflow for Testing

```bash
# Feature branch for tests
git checkout -b feature/add-tests

# Write tests
npm run test:watch  # Development mode

# Run full suite
npm run test

# Commit tests
git add src/
git commit -m "test: add unit tests for [component]"

# Merge to main
git push origin feature/add-tests
# Create PR and merge after review
```

## Performance Optimization Techniques

### Code Splitting
```typescript
// Route-based code splitting
import { lazy, Suspense } from 'react'

const ChatPage = lazy(() => import('./pages/ChatPage'))
const GoalsPage = lazy(() => import('./pages/GoalsPage'))

<Suspense fallback={<Loading />}>
  <ChatPage />
</Suspense>
```

### Image Optimization
```typescript
// Use next-gen formats
<img src="image.webp" alt="..." />

// Lazy load images
<img src="image.jpg" loading="lazy" />
```

### Memoization
```typescript
import { memo } from 'react'

const MessageBubble = memo(({ message }) => (
  <div>{message.content}</div>
))
```

## Timeline

**Day 1 (3 hours)**
- [ ] Setup test infrastructure (30 min)
- [ ] Write component tests (90 min)
- [ ] Write hook tests (60 min)

**Day 2 (3 hours)**
- [ ] Build optimization (60 min)
- [ ] Responsive testing (60 min)
- [ ] Deploy to Vercel (60 min)

## Success Criteria

✅ **Testing:**
- 75%+ code coverage
- All tests passing
- E2E tests working

✅ **Performance:**
- Lighthouse 90+
- Bundle <200KB
- FCP <1.5s

✅ **Deployment:**
- Live on Vercel
- Zero downtime
- Auto-deployments working

✅ **User Experience:**
- Responsive on all devices
- Smooth animations
- No console errors

## Commands Ready

```bash
# Development
npm run test:watch

# Testing
npm run test
npm run test -- --coverage

# Build & Optimize
pnpm build:web
npm run preview

# Analysis
npm run build:web -- --analyze

# Deployment (Vercel)
vercel deploy --prod
```

## Next: FASE 3 - Desktop (Electron)

After Phase 2.3 completion:
- Wrap React app in Electron
- Code signing for Windows/Mac
- Auto-updater infrastructure
- Installer builds
- **Target: Dec 4-18, 2026**

---

**Current Status:** Ready to implement  
**Previous Completion:** Phase 2.1 ✅ Phase 2.2 ✅  
**Estimated Time:** 4-6 hours for all tasks

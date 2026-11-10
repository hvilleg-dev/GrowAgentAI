# Pre-Deploy Checklist - GrowAgentAI Staging

**Date**: 2026-11-10
**Target**: Staging Environment
**Changes**: 20 commits (Session Lifecycle + 2FA + i18n)

---

## ✅ Code Quality Checks

### Git & Commits
- [ ] All commits pushed to GitHub
- [ ] No uncommitted changes
- [ ] Commit messages clear and descriptive
- [ ] No sensitive data in commits (.env, secrets, keys)

**Command to verify:**
```bash
git status  # Should be: On branch main, nothing to commit
git log --oneline -10  # Review recent commits
```

### TypeScript & Linting
- [ ] No TypeScript errors
- [ ] No console.error or console.warn
- [ ] No commented-out code blocks
- [ ] Consistent naming conventions

**Backend:**
```bash
cd backend
npm run build  # Should have 0 errors
```

**Frontend:**
```bash
cd frontend/packages/web
npm run build  # Should have 0 errors
```

### Tests
- [ ] All unit tests passing
- [ ] Test coverage > 70% (critical paths)
- [ ] No flaky tests
- [ ] No skipped tests (x.test, skip())

**Backend:**
```bash
npm test -- --coverage
# Expected output:
# PASS  src/__tests__/session-lifecycle.test.ts
# PASS  src/__tests__/2fa.test.ts
# Tests:        50+ passed
```

**Frontend:**
```bash
npm test
# Expected: All tests pass
```

---

## 🔧 Environment Setup

### Backend Environment Variables
```env
NODE_ENV=staging
DATABASE_URL=postgresql://user:pass@staging-db:5432/growagentai_staging
JWT_SECRET=<staging-secret-key>
LOG_LEVEL=info
PORT=3000
API_TIMEOUT=30000
```

**Verify:**
```bash
echo $DATABASE_URL  # Should not be empty
# Check all required vars exist
```

### Frontend Environment Variables
```env
VITE_API_URL=https://staging-api.growagentai.com
VITE_I18N_FALLBACK_LOCALE=en
VITE_DEBUG_MODE=false
```

**Verify:**
```bash
cat .env.staging
# Should contain all required vars
```

---

## 🗄️ Database Checks

### Backup Creation
- [ ] Database backed up to S3 / external storage
- [ ] Backup verified (can restore)
- [ ] Backup timestamp documented

**Command:**
```bash
# Example PostgreSQL backup
pg_dump -h staging-db -U user -d growagentai_staging > backup-2026-11-10.sql
# Verify backup
wc -l backup-2026-11-10.sql  # Should be > 0 lines
```

### Migration Scripts
- [ ] Migration scripts created
- [ ] Migration scripts tested locally
- [ ] Rollback scripts prepared
- [ ] Data integrity checks added

**New columns for Sesion:**
```sql
✅ status (ACTIVE/PAUSED/CLOSED)
✅ expiresAt (TIMESTAMP)
✅ pausedAt (TIMESTAMP)
✅ pausedDuration (INTEGER)
✅ warningShownAt (TIMESTAMP)
```

**Verify existing data:**
```bash
SELECT COUNT(*) FROM sesiones;  # Know count before deploy
SELECT status, COUNT(*) FROM sesiones GROUP BY status;  # Before: all NULL or backfilled
```

---

## 🔐 Security Checks

### Secrets Management
- [ ] No API keys in code
- [ ] No JWT secrets in GitHub
- [ ] Environment variables not logged
- [ ] Sensitive data redacted in logs

**Search for secrets:**
```bash
git grep -i "secret\|password\|key\|token" -- ':!package-lock.json'
# Should not match actual secrets, only variable names
```

### Authentication & Authorization
- [ ] JWT token validation implemented
- [ ] Auth middleware protecting routes
- [ ] 2FA validation on /verify-2fa
- [ ] Rate limiting on sensitive endpoints

**Test 2FA endpoint:**
```bash
curl -X POST http://localhost:3000/api/auth/verify-2fa \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","code":"invalid"}'
# Expected: 401 Unauthorized
```

### CORS Configuration
- [ ] CORS origins restricted to staging domain
- [ ] Credentials allowed (cookies)
- [ ] Proper headers configured

```javascript
// Verify in backend
cors({
  origin: process.env.STAGING_FRONTEND_URL,
  credentials: true
})
```

---

## 📦 Dependencies Check

### Backend Dependencies
- [ ] No security vulnerabilities (npm audit)
- [ ] All packages up to date
- [ ] No unused dependencies
- [ ] Lock file committed

**Check:**
```bash
npm audit  # Should show 0 vulnerabilities
npm outdated  # Review updates
```

### Frontend Dependencies
- [ ] No security vulnerabilities
- [ ] React, React-Router latest minor
- [ ] Redux, React Query stable versions
- [ ] Lock file committed

**Check:**
```bash
npm audit  # 0 vulnerabilities
npm list react react-dom  # Verify versions
```

---

## 🎨 Frontend Build Verification

### Build Output
- [ ] Build succeeds without errors
- [ ] No warnings in build output
- [ ] Bundle size acceptable
- [ ] All assets included

**Build check:**
```bash
npm run build
# Check dist/ exists with index.html
ls -la dist/
```

### Assets & Static Files
- [ ] All images present
- [ ] All fonts included
- [ ] CSS bundles generated
- [ ] JavaScript chunks optimized

**Verify:**
```bash
du -sh dist/  # Bundle size should be reasonable
ls dist/assets/  # Check for CSS, JS files
```

### Translations
- [ ] All 100+ i18n keys present
- [ ] Both EN and ES complete
- [ ] No missing translations (no [key] in UI)
- [ ] Fallback locale configured

**Check translation files:**
```bash
grep -c '"' src/locales/en/translation.json
grep -c '"' src/locales/es/translation.json
# Should have similar counts (~100+)
```

---

## 🎯 Feature Verification (Local First)

### Session Lifecycle
- [ ] Timer starts at 45:00
- [ ] Timer counts down each second
- [ ] After 10 min inactivity: pauses (yellow dot)
- [ ] On activity: resumes (green dot)
- [ ] At 2 min remaining: warning toast
- [ ] At 0:00: closes (red dot), input disabled

**Manual test in local:**
```bash
# Start app
npm run dev

# Create session, watch timer
# Don't type for 10 minutes → should pause
# Type something → should resume
# Wait until 2:00 → warning toast
```

### 2FA Authentication
- [ ] Enable 2FA shows modal with QR
- [ ] QR code scannable with authenticator apps
- [ ] Logout and login again
- [ ] 2FA modal appears with code input
- [ ] 6-digit validation works (reject < or > 6)
- [ ] Valid code → login success
- [ ] Invalid code → error message

**Test flow:**
```bash
1. Settings → Enable 2FA
2. Scan QR with Google Authenticator
3. Logout
4. Login with email/password
5. Enter 6-digit code
6. Should be logged in
```

### Translations
- [ ] Switch to Spanish in Settings
- [ ] ALL text changes to Spanish
- [ ] Menu items translated (Chat → Chat, Goals → Metas)
- [ ] Session states translated (In Progress → En Progreso)
- [ ] Buttons translated
- [ ] Switch back to English → all English

**Verify critical pages:**
- [ ] Chat page: menu, timer, buttons
- [ ] Goals page: title, states, empty message
- [ ] Settings page: labels, fields
- [ ] Instructions page: coaching styles

### Dark Mode
- [ ] Settings → Dark mode
- [ ] Text readable in all components
- [ ] Buttons have enough contrast
- [ ] Timer readable in header
- [ ] Toast notifications visible
- [ ] Dark mode saves on refresh

---

## 📊 Performance Baseline

**Local Performance (Baseline for comparison):**
```
Homepage load time: < 2 seconds
API response time: < 200ms
Session creation: < 500ms
Message sending: < 1 second
Language switch: < 500ms
Dark mode toggle: < 200ms
```

**Command to test (using DevTools):**
```bash
# Open DevTools → Network tab
# Reload page → check request times
# Expected: DOMContentLoaded < 2s, Load < 3s
```

---

## 🔍 Code Review Checklist

### Backend Code
- [ ] Session lifecycle logic correct
- [ ] 2FA verification secure
- [ ] No SQL injection vulnerabilities
- [ ] Proper error handling
- [ ] Logging implemented

**Key files to review:**
```
- src/database/entities/Sesion.ts ✅
- src/routes/auth.routes.ts ✅
- src/controllers/SessionController.ts ✅
```

### Frontend Code
- [ ] Hooks properly implemented
- [ ] No memory leaks (cleanup in useEffect)
- [ ] Redux actions properly dispatched
- [ ] No infinite loops
- [ ] TypeScript types strict

**Key files to review:**
```
- src/hooks/useSessionTimer.ts ✅
- src/hooks/useActivityDetector.ts ✅
- src/pages/ChatPage.tsx ✅
- src/pages/LoginPage.tsx ✅
```

---

## 📋 Documentation Check

- [ ] DEPLOY_GUIDE.md created
- [ ] TESTING_MANUAL.md created
- [ ] IMPLEMENTATION_SUMMARY.md created
- [ ] Inline code comments present
- [ ] README updated (if needed)

**Verify:**
```bash
ls -la | grep -E "DEPLOY|TESTING|IMPLEMENTATION"
# Should see all 3 files
```

---

## 🚀 Final Checks (Day of Deploy)

### 1 Hour Before
- [ ] Team notified of deploy window
- [ ] Backup created and verified
- [ ] All deployments scripts ready
- [ ] Monitoring dashboards open
- [ ] Rollback plan reviewed

### Immediate Pre-Deploy
- [ ] No new commits to main
- [ ] All team members present
- [ ] Communication channel open (Slack, Teams)
- [ ] Database connections tested

**Verify git status:**
```bash
git status  # No uncommitted changes
git fetch origin  # Latest from GitHub
```

---

## ✅ Deployment Sign-Off

**Before pressing "Deploy":**

- [ ] Backend: npm run build succeeds
- [ ] Frontend: npm run build succeeds
- [ ] Tests: All passing (npm test)
- [ ] Security: npm audit shows 0 vulnerabilities
- [ ] Database: Backup created
- [ ] Environment: All vars configured
- [ ] Documentation: Deploy guide reviewed
- [ ] Team: All reviewers approved
- [ ] Monitoring: Dashboards ready

---

## 📞 Escalation Contacts

If issues arise during deploy:

- **Critical Backend Issue**: Backend Lead
- **Frontend Build Failing**: Frontend Lead
- **Database Migration Failed**: DBA / DevOps
- **2FA Not Working**: Security Team
- **Performance Issues**: Performance Team

---

## 🎯 Success Criteria

After deploy to staging:

✅ Frontend loads without errors
✅ Backend API responding (curl health check)
✅ Can login with 2FA
✅ Can create session with timer
✅ Can change language to Spanish
✅ Can switch to dark mode
✅ All smoke tests pass

---

**READY FOR STAGING DEPLOY** 🚀

Follow this checklist step-by-step. Do not proceed to next step if current step fails.

Once all items checked, proceed with DEPLOY_GUIDE.md

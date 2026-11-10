# Deploy to Staging - GrowAgentAI

## Pre-Deploy Checklist

- [ ] Todos los tests pasan
- [ ] No hay errores en console
- [ ] Variables de entorno configuradas
- [ ] Database migrations preparadas
- [ ] Backups creados
- [ ] Team notificado

---

## 📋 Commits a Deployar (20 commits)

```
6ca0720 - docs: add comprehensive implementation summary
b6d1800 - docs: add comprehensive manual testing guide
6b31790 - test: add comprehensive unit tests
8c83739 - feat: implement 2FA modal and login flow (frontend)
2ad11e0 - feat: implement 2FA verification flow (backend)
4910514 - feat: add session lifecycle translation keys
a816264 - feat: mount ToastContainer in App
5707e23 - feat: integrate session lifecycle in ChatPage
59c5da7 - feat: implement session lifecycle hooks
a5af64f - feat: implement Toast notification system
0ca64bb - feat: extend frontend types and Redux
05367f7 - feat: add session lifecycle management
... (traducciones i18n)
```

---

## 🔧 Backend Deployment

### 1. Pull Latest Changes
```bash
cd backend
git pull origin main
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Database Migrations
```bash
# Create migration for new session fields
npm run typeorm migration:generate -- -n AddSessionLifecycle

# Run migrations
npm run typeorm migration:run
```

**Migration SQL (si es necesario manual):**
```sql
-- Add session lifecycle columns to sesiones table
ALTER TABLE sesiones 
ADD COLUMN status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'CLOSED')),
ADD COLUMN "expiresAt" TIMESTAMP NOT NULL,
ADD COLUMN "pausedAt" TIMESTAMP,
ADD COLUMN "pausedDuration" INTEGER DEFAULT 0,
ADD COLUMN "warningShownAt" TIMESTAMP;

-- Backfill existing sessions
UPDATE sesiones SET 
  status = CASE WHEN "finalizadaEn" IS NOT NULL THEN 'CLOSED' ELSE 'ACTIVE' END,
  "expiresAt" = "criadaEn" + INTERVAL '45 minutes',
  "pausedDuration" = 0
WHERE "expiresAt" IS NULL;
```

### 4. Build Backend
```bash
npm run build
```

### 5. Run Tests
```bash
npm test
# Expected: All tests pass
```

### 6. Environment Variables (Staging)
```env
NODE_ENV=staging
DATABASE_URL=postgresql://user:password@staging-db:5432/growagentai_staging
JWT_SECRET=your-staging-secret-key
LOG_LEVEL=info
PORT=3000
```

### 7. Start Backend
```bash
npm start
# or with PM2
pm2 start dist/src/index.js --name "growagentai-api"
```

### 8. Verify Backend
```bash
curl http://localhost:3000/api/auth/profile-status/test-user-id
# Expected: 200 OK
```

---

## 🎨 Frontend Deployment

### 1. Pull Latest Changes
```bash
cd frontend/packages/web
git pull origin main
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables (Staging)
```env
VITE_API_URL=https://staging-api.growagentai.com
VITE_I18N_FALLBACK_LOCALE=en
```

### 4. Build Frontend
```bash
npm run build
# Output: dist/ folder
```

### 5. Run Tests
```bash
npm test
# Expected: All tests pass
```

### 6. Preview Build Locally (Optional)
```bash
npm run preview
# Visit http://localhost:4173
```

### 7. Deploy to Staging Server
**Option A: Vercel (Recommended)**
```bash
# Connect staging branch
vercel link
vercel deploy --prod

# Set environment variables in Vercel dashboard
# - VITE_API_URL=https://staging-api.growagentai.com
```

**Option B: Manual Server**
```bash
# Copy dist to server
scp -r dist/ user@staging-server:/var/www/growagentai

# Configure nginx (example)
server {
    listen 443 ssl;
    server_name staging.growagentai.com;
    
    root /var/www/growagentai;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass https://staging-api.growagentai.com;
    }
}
```

### 8. Verify Frontend
```bash
# Check if accessible
curl https://staging.growagentai.com
# Expected: HTML homepage
```

---

## 🧪 Post-Deploy Testing

### Smoke Tests (5 min)

1. **Login**
   ```
   - Email: test@example.com
   - Password: password123
   ✅ Should redirect to /
   ```

2. **Create Session**
   ```
   - Click "Nueva Sesión"
   - Timer should show 45:00
   - Point should be green (🟢)
   ✅ Session created
   ```

3. **Chat Message**
   ```
   - Type message: "Test message"
   - Click Send
   ✅ Message appears
   ```

4. **Change Language**
   ```
   - Settings → Language → Español
   - Menu should change to Spanish
   ✅ Language changed
   ```

5. **2FA Modal**
   ```
   - Logout
   - If 2FA enabled: modal appears
   - Enter 6-digit code
   ✅ 2FA modal works
   ```

### Full E2E Tests (30 min)
Follow `TESTING_MANUAL.md`:
- Session lifecycle (45 min timer)
- Inactivity pause/resume
- 2FA authentication
- Translations (EN/ES)
- Dark mode
- Toast notifications

---

## 📊 Monitoring Staging

### Backend Logs
```bash
pm2 logs growagentai-api
# Watch for errors
```

### Frontend Errors
```bash
# Check browser console (F12)
# Check Vercel analytics dashboard
```

### Database
```bash
psql -h staging-db -U user -d growagentai_staging
SELECT COUNT(*) FROM sesiones WHERE status = 'ACTIVE';
```

### API Endpoints to Test
```bash
# Health check
curl https://staging-api.growagentai.com/api/auth/profile-status/test-user

# Create session
curl -X POST https://staging-api.growagentai.com/api/sessions \
  -H "Authorization: Bearer <token>" \
  -d '{"usuarioId":"test-user"}'

# Verify 2FA
curl -X POST https://staging-api.growagentai.com/api/auth/verify-2fa \
  -d '{"userId":"test-user","code":"123456"}'
```

---

## 🚨 Rollback Plan

If something goes wrong:

### Frontend Rollback (Vercel)
```bash
# Revert to previous deployment
vercel rollback
```

### Backend Rollback (Git)
```bash
# Revert to previous commit
git revert HEAD
npm install
npm run build
npm start
```

### Database Rollback (Migrations)
```bash
# Revert last migration
npm run typeorm migration:revert
```

---

## ⚠️ Known Issues & Workarounds

### Issue: 2FA codes not validating
**Workaround**: Currently mock (accepts any 6 digits). To test real 2FA in prod:
- Implement speakeasy library
- Test with actual authenticator app

### Issue: Session timer showing wrong time
**Cause**: Client/server time mismatch
**Fix**: Sync server time with NTP

### Issue: Translations not updating
**Cause**: Browser cache
**Fix**: Hard refresh (Ctrl+Shift+R) or clear LocalStorage

---

## 📞 Support Contacts

- **Backend Issues**: Backend team
- **Frontend Issues**: Frontend team
- **Database Issues**: DevOps team
- **Monitoring**: DevOps team

---

## ✅ Staging Sign-off Checklist

**Backend:**
- [ ] All services running
- [ ] Database migrations successful
- [ ] Tests passing (100%)
- [ ] No errors in logs
- [ ] API endpoints responding
- [ ] 2FA verification working
- [ ] Session lifecycle working (45 min timer)

**Frontend:**
- [ ] Build successful
- [ ] No console errors
- [ ] All pages loading
- [ ] Translations working (EN/ES)
- [ ] Dark mode working
- [ ] Responsive on mobile/tablet/desktop
- [ ] 2FA modal appearing
- [ ] Toast notifications appearing

**Integration:**
- [ ] Login flow end-to-end
- [ ] Session creation and timer
- [ ] Message sending and receiving
- [ ] Language switching
- [ ] Dark mode toggle
- [ ] 2FA complete flow

**Performance:**
- [ ] Page load time < 3s
- [ ] API response time < 500ms
- [ ] No memory leaks
- [ ] No excessive CPU usage

---

## 📈 Success Metrics

Track after deploy:

```
Session Lifecycle:
- ✅ Timer countdown accurate
- ✅ Pause after 10 min inactivity
- ✅ Resume on activity
- ✅ Warning at 2 min
- ✅ Auto-close at 0:00

Authentication:
- ✅ 2FA modal appears for enabled users
- ✅ 6-digit validation working
- ✅ Error messages clear

User Experience:
- ✅ Toast notifications visible
- ✅ Dark mode legible
- ✅ Translations complete
- ✅ No UI broken elements

Performance:
- ✅ Page loads in < 3 seconds
- ✅ No lag in timer
- ✅ Smooth language switching
```

---

## 🎉 Go-Live Criteria

✅ All smoke tests pass
✅ Full E2E tests pass
✅ No critical bugs in logs
✅ Performance acceptable
✅ Team sign-off received

---

## 📝 Post-Deploy Report

After successful staging deployment, create report with:

1. **Date/Time**: Deployment timestamp
2. **Version**: Commit hash
3. **Duration**: Time to deploy
4. **Tests**: Pass/fail count
5. **Issues**: Any encountered
6. **Performance**: Load times, API response
7. **Next Steps**: Move to production?

---

**Ready for Staging!** 🚀

Follow this guide step-by-step. If any issue occurs, refer to rollback plan.

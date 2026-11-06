# 🚀 Quick Start - Next Session (FASE 3.2-3.4 & Deploy)

**Previous Session:** FASE 2 (100% done) + FASE 3.1 (Electron setup done)  
**This Session Goal:** Deploy to Vercel + Execute FASE 3.2, 3.3, 3.4

---

## 📋 Session Checklist

### 1. DEPLOY FASE 2 TO VERCEL (30 min)

```bash
# Push all commits to GitHub
git push origin main

# Vercel auto-deploys on push
# Or manually:
vercel --prod

# Set environment variables in Vercel Dashboard:
# - VITE_API_URL=https://api.growagentai.com
# - VITE_SENTRY_DSN=your-key
# - VITE_APP_NAME=GrowAgentAI
# - VITE_APP_VERSION=2.0.0

# Verify deployment
curl https://growagentai.vercel.app/
```

---

### 2. EXECUTE FASE 3.2 - Auto-Update (3-4 hours)

**Documentation:** `FASE_3_2_AUTO_UPDATE.md`

```bash
cd frontend/packages/desktop

# Install electron-updater
npm install electron-updater

# Implement in main/main.ts:
# - autoUpdater.checkForUpdatesAndNotify()
# - IPC handlers for update events
# - Notification UI component

# Test:
npm run dev
# Change version in package.json and rebuild to test update flow
```

**Files to modify:**
- `main/main.ts` - Add autoUpdater
- `preload/index.ts` - Add update API methods
- Create `src/components/UpdateNotification.tsx` (in web app)

---

### 3. EXECUTE FASE 3.3 - Code Signing (4-5 hours)

**Documentation:** `FASE_3_3_CODE_SIGNING.md`

#### Windows
```bash
# Create self-signed certificate (development)
New-SelfSignedCertificate -CertStoreLocation "cert:\CurrentUser\My" `
  -Subject "CN=GrowAgentAI" -KeySpec Signature

# Export as PFX
# Set environment:
export CSC_LINK=certificate.pfx
export CSC_KEY_PASSWORD=your-password
```

#### macOS
```bash
# Get Apple Developer certificate from https://developer.apple.com
# Set environment:
export CSC_LINK=developer-id.p12
export CSC_KEY_PASSWORD=password
export APPLE_ID=your@email.com
export APPLE_PASSWORD=app-specific-password
export APPLE_TEAM_ID=ABCD123EFG
```

#### Linux
```bash
# Generate GPG key
gpg --full-generate-key
export CSC_LINK=private.key
```

**Update `package.json`:**
```json
{
  "build": {
    "win": {
      "certificateFile": "${CSC_LINK}",
      "certificatePassword": "${CSC_KEY_PASSWORD}"
    },
    "mac": {
      "identity": "Developer ID Application: Your Name (ABCD123EFG)"
    }
  }
}
```

---

### 4. EXECUTE FASE 3.4 - Build & Package (3-4 hours)

**Documentation:** `FASE_3_4_BUILD_PACKAGE.md`

```bash
cd frontend/packages/desktop

# Set environment variables (from 3.3)
export CSC_LINK=certificate.pfx
export CSC_KEY_PASSWORD=password

# Build all platforms
npm run dist

# Or specific platform:
npm run dist:win      # Windows installer + portable
npm run dist:mac      # macOS DMG + ZIP
npm run dist:linux    # Linux AppImage + DEB
```

**Outputs in `dist/`:**
- `GrowAgentAI Setup 2.0.0.exe` - Windows installer
- `GrowAgentAI 2.0.0.exe` - Windows portable
- `GrowAgentAI-2.0.0.dmg` - macOS
- `GrowAgentAI-2.0.0.AppImage` - Linux
- `growagentai_2.0.0_amd64.deb` - Linux

#### Test Installers
```bash
# Windows
dist/GrowAgentAI\ Setup\ 2.0.0.exe

# macOS
hdiutil attach dist/GrowAgentAI-2.0.0.dmg

# Linux
./dist/GrowAgentAI-2.0.0.AppImage
```

#### Create GitHub Release
```bash
git tag v2.0.0
git push origin v2.0.0

# Upload to GitHub:
# 1. Go to https://github.com/your-org/GrowAgentAI/releases
# 2. New Release
# 3. Upload dist/ files
# 4. Update latest.yml for auto-update
```

---

## 🎯 Time Estimates

| Task | Time | Status |
|------|------|--------|
| Deploy to Vercel | 30 min | ⏳ |
| FASE 3.2 Auto-Update | 3-4 hrs | ⏳ |
| FASE 3.3 Code Signing | 4-5 hrs | ⏳ |
| FASE 3.4 Build/Package | 3-4 hrs | ⏳ |
| **Total Session** | **10-14 hrs** | ⏳ |

**Can be split across 2-3 sessions**

---

## 📚 Documentation to Reference

1. **Deployment:** `VERCEL_DEPLOYMENT_GUIDE.md`
2. **Auto-Update:** `FASE_3_2_AUTO_UPDATE.md`
3. **Code Signing:** `FASE_3_3_CODE_SIGNING.md`
4. **Build/Package:** `FASE_3_4_BUILD_PACKAGE.md`
5. **Setup Guide:** `FASE_3_SETUP_GUIDE.md`

---

## ✅ Pre-Session Checklist

- [ ] Read this file
- [ ] Review `FASE_3_COMPLETADO.md` for overview
- [ ] Check all commits are pushed: `git push origin main`
- [ ] Verify Vercel account exists
- [ ] Have GitHub PAT ready for releases
- [ ] Have code signing certs ready (or create self-signed)

---

## 🚨 Common Issues

### "Build fails after adding electron-updater"
```bash
npm install
npm run type-check
npm run build
```

### "Certificate not found"
Windows: Check `certmgr.msc`  
macOS: Check Keychain

### "Vercel deployment fails"
- Check build logs: `vercel logs`
- Verify environment variables set
- Ensure dist folder has files

---

## 🎉 After Completion

- ✅ Web app deployed to Vercel
- ✅ Desktop app auto-updates working
- ✅ All platforms signed & notarized
- ✅ Installers built and tested
- ✅ GitHub releases published
- ✅ Auto-download of updates working

**Result:** GrowAgentAI v2.0.0 fully deployed on web + desktop!

---

## 📝 Git Commands Reference

```bash
# Push to main (auto-deploy to Vercel)
git push origin main

# Create release tag
git tag v2.0.0
git push origin v2.0.0

# Check all commits
git log --oneline -10

# View current branch
git status
```

---

**Ready?** Start with Vercel deployment, then execute 3.2-3.4 in order.

Let me know if you need any clarifications!

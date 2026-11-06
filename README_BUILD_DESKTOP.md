# GrowAgentAI Desktop - Build & Release Guide

Quick guide to build desktop installers for Windows, macOS, and Linux.

---

## 🚀 Quick Start (2 Options)

### Option 1: Build Locally (Recommended for Development)

```bash
cd frontend/packages/desktop

# Setup code signing
./setup-signing.sh              # macOS/Linux
# or
.\setup-signing.ps1             # Windows

# Build all platforms
npm run dist

# Or specific platform
npm run dist:win                # Windows only
npm run dist:mac                # macOS only
npm run dist:linux              # Linux only
```

**Output:** `dist/` folder with installers

### Option 2: Automated Release (CI/CD)

```bash
# Create release tag
git tag v2.0.0
git push origin v2.0.0

# GitHub Actions automatically:
# 1. Builds for all platforms
# 2. Creates GitHub release
# 3. Uploads installers
# 4. Configures auto-updates
```

---

## 📋 Prerequisites

### Windows
- PowerShell 5.0+
- Administrator access (for certificate creation)

### macOS
- Apple Developer account (if code signing)
- Xcode Command Line Tools

### Linux
- GPG (for signing)
- Build tools (gcc, make)

---

## 🔐 Code Signing Setup

Each platform requires different setup:

### Windows

```powershell
cd frontend/packages/desktop
.\setup-signing.ps1

# Prompts for:
# - Certificate password
# Outputs: certificate.pfx
```

### macOS

```bash
cd frontend/packages/desktop
./setup-signing.sh

# Prompts for:
# - Certificate path (.p12 file)
# - Apple ID
# - App-specific password
# - Team ID
# Outputs: .env.local
```

### Linux

```bash
cd frontend/packages/desktop
./setup-signing.sh

# Creates GPG key and configures signing
# Outputs: .env.local
```

---

## 🏗️ Build Process

### Step 1: Build Web App

```bash
cd frontend/packages/web
npm run build

# Output: dist/ folder with static files
```

### Step 2: Build Desktop App

```bash
cd frontend/packages/desktop

# Compile TypeScript
npm run build:electron

# Create installers with electron-builder
npm run dist

# Wait 2-3 minutes...
```

### Step 3: Verify Installers

```bash
# List output files
ls -la dist/

# You should see:
# - GrowAgentAI Setup 2.0.0.exe (Windows)
# - GrowAgentAI 2.0.0.exe (Windows portable)
# - GrowAgentAI-2.0.0.dmg (macOS)
# - GrowAgentAI-2.0.0.AppImage (Linux)
# - growagentai_2.0.0_amd64.deb (Linux)
# - latest.yml (auto-update manifest)
```

---

## 🧪 Test Installers

### Windows

```bash
# Run installer
./dist/"GrowAgentAI Setup 2.0.0.exe"

# Or portable
./dist/"GrowAgentAI 2.0.0.exe"

# Verify:
# 1. Installation completes
# 2. Shortcuts created
# 3. App launches
# 4. Can login and use features
```

### macOS

```bash
# Mount DMG
hdiutil attach dist/GrowAgentAI-2.0.0.dmg

# Run app
open /Volumes/GrowAgentAI/GrowAgentAI.app

# Eject
hdiutil detach /Volumes/GrowAgentAI
```

### Linux

```bash
# Run AppImage
./dist/GrowAgentAI-2.0.0.AppImage

# Or install DEB
sudo dpkg -i dist/growagentai_2.0.0_amd64.deb
growagentai
```

---

## 📤 Release to GitHub

### Create Release

```bash
# Create tag (triggers CI/CD)
git tag v2.0.0
git push origin v2.0.0

# Or manually upload to GitHub:
# 1. Go to https://github.com/hvilleg-dev/GrowAgentAI/releases
# 2. Create new release
# 3. Upload files from dist/
```

### Upload Files

Essential files to upload:

```
✅ GrowAgentAI Setup 2.0.0.exe
✅ GrowAgentAI 2.0.0.exe
✅ GrowAgentAI-2.0.0.dmg
✅ GrowAgentAI-2.0.0.AppImage
✅ growagentai_2.0.0_amd64.deb
✅ latest.yml (for auto-updates)
✅ latest-mac.yml
✅ latest-linux.yml
```

---

## 🔄 Auto-Update Testing

1. **Deploy v2.0.0**
2. **Install app** → Should work normally
3. **Deploy v2.0.1** 
4. **Open app** → Should show "Update downloaded" notification
5. **Click "Restart Now"** → App updates to v2.0.1

---

## 📝 Environment Variables

If not using setup scripts, create `.env.local`:

```bash
# Windows
CSC_LINK=./certificate.pfx
CSC_KEY_PASSWORD=your-password

# macOS
APPLE_ID=your@email.com
APPLE_PASSWORD=your-app-specific-password
APPLE_TEAM_ID=ABCD123EFG

# Linux
CSC_LINK=your-gpg-key-id
```

---

## 🐛 Troubleshooting

### Build Fails

```bash
# Clear cache
rm -rf dist node_modules

# Reinstall
npm install

# Try again
npm run dist
```

### Certificate Error

```bash
# Windows: Check certificate store
certmgr.msc

# macOS: Check Keychain
security find-identity -v -p codesigning

# List environment variables
env | grep CSC
```

### App Won't Launch

1. Check logs: `npm run dev`
2. Verify React build: `cd ../web && npm run build`
3. Check main process: Look at console output
4. Verify API connection: Check backend is running

---

## 📊 File Sizes

| File | Size |
|------|------|
| GrowAgentAI Setup 2.0.0.exe | ~180MB |
| GrowAgentAI 2.0.0.exe | ~180MB |
| GrowAgentAI-2.0.0.dmg | ~190MB |
| GrowAgentAI-2.0.0.AppImage | ~200MB |
| growagentai_2.0.0_amd64.deb | ~170MB |

---

## 🚀 Next Steps

1. ✅ Setup code signing
2. ✅ Build installers (`npm run dist`)
3. ✅ Test each platform
4. ✅ Create GitHub release
5. ✅ Upload installers
6. ✅ Test auto-update

---

## 📚 More Information

- **Build Config:** `frontend/packages/desktop/electron-builder.yml`
- **Release Workflow:** `frontend/packages/desktop/RELEASE_WORKFLOW.md`
- **Auto-Update Guide:** `FASE_3_2_AUTO_UPDATE.md`
- **Code Signing Guide:** `FASE_3_3_CODE_SIGNING.md`
- **Build & Package Guide:** `FASE_3_4_BUILD_PACKAGE.md`

---

## ✨ Success!

Once you complete these steps, your users can download GrowAgentAI from GitHub and stay up-to-date automatically! 🎉

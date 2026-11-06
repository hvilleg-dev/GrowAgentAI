# FASE 3.4: Build & Package for Distribution

**Status:** 🔄 Ready to Execute  
**Date:** November 6, 2026  

---

## Overview

Build production installers for Windows, macOS, and Linux with multi-platform support.

---

## Build Targets

### Windows

**NSIS Installer** (`GrowAgentAI Setup 2.0.0.exe`)
- User-friendly installer
- Add to Start Menu
- Desktop shortcut
- Uninstall option
- Size: ~150-200MB

**Portable** (`GrowAgentAI 2.0.0.exe`)
- Single executable
- No installation
- No registry changes
- Runs from USB
- Size: ~150-200MB

### macOS

**DMG** (`GrowAgentAI-2.0.0.dmg`)
- Drag-to-Applications installer
- Code signed & notarized
- Gatekeeper approved
- Size: ~150-200MB

**ZIP** (`GrowAgentAI-2.0.0-mac.zip`)
- Direct app file
- For manual updates
- Size: ~150-200MB

### Linux

**AppImage** (`GrowAgentAI-2.0.0.AppImage`)
- Single executable
- Works on all distributions
- Self-contained
- Size: ~150-200MB

**DEB** (`growagentai_2.0.0_amd64.deb`)
- Ubuntu/Debian package
- Integrates with package manager
- System-wide installation
- Size: ~150-200MB

**RPM** (Optional)
- For Fedora/RHEL
- System-wide installation
- Size: ~150-200MB

---

## Configuration

### Update `electron-builder.yml`

Create `frontend/packages/desktop/electron-builder.yml`:

```yaml
appId: com.growagentai.app
productName: GrowAgentAI
directories:
  buildResources: resources
  output: dist

win:
  target:
    - nsis
    - portable
  certificateFile: ${CSC_LINK}
  certificatePassword: ${CSC_KEY_PASSWORD}

nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true
  createDesktopShortcut: true
  createStartMenuShortcut: true
  shortcutName: GrowAgentAI

portable:
  artifactName: ${productName}-${version}.${ext}

mac:
  target:
    - dmg
    - zip
  category: public.app-category.productivity
  identity: ${CSC_NAME}
  certificateFile: ${CSC_LINK}
  certificatePassword: ${CSC_KEY_PASSWORD}
  notarize:
    teamId: ${APPLE_TEAM_ID}

dmg:
  contents:
    - x: 130
      y: 220
      type: file
      path: /Applications
    - x: 410
      y: 220
      type: link

linux:
  target:
    - AppImage
    - deb
  category: Office
  synopsis: AI Coaching Platform

appImage:
  artifactName: ${productName}-${version}.${ext}

deb:
  depends:
    - gconf2
    - gconf-service
    - libnotify4
    - libappindicator1
  category: Office
```

---

## Build Process

### 1. Prepare Environment

```bash
cd frontend/packages/desktop

# Install dependencies
npm install

# Set environment variables
export CSC_LINK=certificate.pfx
export CSC_KEY_PASSWORD=password
export APPLE_ID=your@email.com
export APPLE_PASSWORD=app-specific-password
export APPLE_TEAM_ID=ABCD123EFG
```

### 2. Build Web App

```bash
cd ../web
npm run build
cd ../desktop
```

### 3. Build All Platforms

```bash
# Windows + macOS + Linux
npm run dist

# Windows only
npm run dist:win

# macOS only
npm run dist:mac

# Linux only
npm run dist:linux
```

### 4. Sign and Notarize

Automatically handled by electron-builder if:
- Environment variables set
- Certificates configured
- CI/CD secrets available

---

## Output Structure

```
dist/
├── GrowAgentAI Setup 2.0.0.exe          # Windows installer
├── GrowAgentAI 2.0.0.exe                # Windows portable
├── GrowAgentAI-2.0.0.dmg               # macOS installer
├── GrowAgentAI-2.0.0-mac.zip           # macOS zip
├── GrowAgentAI-2.0.0.AppImage          # Linux AppImage
├── growagentai_2.0.0_amd64.deb         # Linux DEB
├── latest.yml                           # Update manifest
├── latest-mac.yml                       # macOS update manifest
├── latest-linux.yml                     # Linux update manifest
└── builder-effective-config.yaml        # Build config used
```

---

## Testing Installers

### Windows

```bash
# Test NSIS installer
dist/GrowAgentAI\ Setup\ 2.0.0.exe

# Test portable
dist/GrowAgentAI\ 2.0.0.exe
```

**Verify:**
- Installation path correct
- Start Menu shortcuts created
- Desktop shortcut created
- Uninstall works
- App launches
- API connectivity works

### macOS

```bash
# Mount DMG
hdiutil attach dist/GrowAgentAI-2.0.0.dmg

# Drag app to Applications
# Verify code signature
codesign -v /Applications/GrowAgentAI.app

# Check notarization
spctl -a -v /Applications/GrowAgentAI.app
```

### Linux

```bash
# Test AppImage
./dist/GrowAgentAI-2.0.0.AppImage

# Install DEB
sudo dpkg -i dist/growagentai_2.0.0_amd64.deb
growagentai

# Verify installation
which growagentai
growagentai --version
```

---

## Release Checklist

- ✅ Version bumped in package.json
- ✅ All tests passing
- ✅ TypeScript validation passed
- ✅ Environment variables set
- ✅ Certificates valid
- ✅ Build successful
- ✅ Installers tested on each OS
- ✅ API connectivity verified
- ✅ Feature functionality verified
- ✅ Performance acceptable
- ✅ No console errors
- ✅ Code signed & notarized
- ✅ Updates work correctly

---

## GitHub Release

### Create Release

```bash
# Tag the release
git tag v2.0.0
git push origin v2.0.0

# Go to GitHub → Releases → New Release
# Select tag v2.0.0
# Add release notes

# Upload artifacts:
# - GrowAgentAI Setup 2.0.0.exe
# - GrowAgentAI 2.0.0.exe
# - GrowAgentAI-2.0.0.dmg
# - GrowAgentAI-2.0.0-mac.zip
# - GrowAgentAI-2.0.0.AppImage
# - growagentai_2.0.0_amd64.deb
# - latest.yml
# - latest-mac.yml
# - latest-linux.yml
```

### Update Website

```markdown
## Download GrowAgentAI 2.0.0

**Windows**
- [Installer (.exe)](https://github.com/.../GrowAgentAI%20Setup%202.0.0.exe)
- [Portable (.exe)](https://github.com/.../GrowAgentAI%202.0.0.exe)

**macOS**
- [DMG](https://github.com/.../GrowAgentAI-2.0.0.dmg)

**Linux**
- [AppImage](https://github.com/.../GrowAgentAI-2.0.0.AppImage)
- [DEB](https://github.com/.../growagentai_2.0.0_amd64.deb)
```

---

## Post-Release

### 1. Monitor Downloads

Check GitHub Releases for download counts and feedback.

### 2. Gather Feedback

- Check GitHub Issues for bug reports
- Monitor user feedback
- Track crash reports

### 3. Plan Next Release

- Address critical bugs
- Plan feature improvements
- Schedule next release

---

## Distribution Channels

### Direct Download
- GitHub Releases (✅ Done)
- Website download page

### Package Managers

**Windows**
- Chocolatey: https://chocolatey.org/
- Scoop: https://scoop.sh/
- Windows Package Manager: https://github.com/microsoft/winget-cli

**macOS**
- Homebrew: `brew install growagentai`
- MacPorts: https://www.macports.org/

**Linux**
- Flathub: https://flathub.org/
- Snap Store: https://snapcraft.io/
- AUR: https://aur.archlinux.org/

---

## Performance Targets

- Install time: < 2 minutes
- First launch: < 5 seconds
- Memory: < 200MB at rest
- CPU: < 5% idle
- Disk: < 500MB installed

---

## Timeline

- Day 1: electron-builder configuration
- Day 2: Windows build & testing
- Day 3: macOS build & testing
- Day 4: Linux build & testing
- Day 5: Release notes & GitHub upload
- Day 6: Testing & verification

---

## Files to Commit

```bash
# Add files
git add frontend/packages/desktop/electron-builder.yml
git add .github/workflows/release.yml

# Commit
git commit -m "feat: add multi-platform build & release configuration"

# Tag
git tag v2.0.0
git push origin main --follow-tags
```

---

**Status:** Ready for implementation  
**Next:** Deploy & Monitor  

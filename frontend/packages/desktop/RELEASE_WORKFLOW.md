# GrowAgentAI Desktop - Release Workflow

Complete guide for building and releasing desktop installers.

---

## Prerequisites

- Node.js 18+
- npm or pnpm
- Code signing certificates (Windows/macOS)
- GitHub account with push access

---

## Step 1: Setup Code Signing

### Windows (Development)

```bash
# Run PowerShell script
.\setup-signing.ps1

# Enter certificate password when prompted
# Script will create certificate.pfx and set environment variables
```

### macOS

```bash
# Run shell script
./setup-signing.sh

# Follow prompts to enter:
# - Certificate path (.p12 file)
# - Apple ID credentials
# - Team ID

# Saves to .env.local (gitignored)
```

### Linux

```bash
# Run shell script
./setup-signing.sh

# Creates GPG key and configures signing
```

---

## Step 2: Build Installers

### Build All Platforms

```bash
# Build for Windows, macOS, and Linux
npm run dist

# Or use shell script
./build-dist.sh all
```

**Output:**
- `dist/GrowAgentAI Setup 2.0.0.exe` - Windows installer
- `dist/GrowAgentAI 2.0.0.exe` - Windows portable
- `dist/GrowAgentAI-2.0.0.dmg` - macOS
- `dist/GrowAgentAI-2.0.0-mac.zip` - macOS ZIP
- `dist/GrowAgentAI-2.0.0.AppImage` - Linux AppImage
- `dist/growagentai_2.0.0_amd64.deb` - Linux DEB
- `dist/latest.yml` - Update manifest

### Build Specific Platform

```bash
npm run dist:win      # Windows only
npm run dist:mac      # macOS only
npm run dist:linux    # Linux only

# Or use shell script
./build-dist.sh win
./build-dist.sh mac
./build-dist.sh linux
```

---

## Step 3: Test Installers

### Windows

```bash
# Test NSIS installer
dist/GrowAgentAI\ Setup\ 2.0.0.exe

# Test portable
dist/GrowAgentAI\ 2.0.0.exe
```

**Verify:**
- Installation completes
- Shortcuts created
- App launches
- API connectivity works

### macOS

```bash
# Mount DMG
hdiutil attach dist/GrowAgentAI-2.0.0.dmg

# Verify code signature
codesign -v /Volumes/GrowAgentAI/GrowAgentAI.app

# Test notarization
spctl -a -v /Volumes/GrowAgentAI/GrowAgentAI.app

# Eject when done
hdiutil detach /Volumes/GrowAgentAI
```

### Linux

```bash
# Test AppImage
./dist/GrowAgentAI-2.0.0.AppImage

# Test DEB installation
sudo dpkg -i dist/growagentai_2.0.0_amd64.deb
growagentai

# Verify app works
```

---

## Step 4: Create GitHub Release

### Create Tag

```bash
# Tag the release
git tag v2.0.0

# Push tag to GitHub
git push origin v2.0.0
```

### Create Release on GitHub

```bash
# Using GitHub CLI
gh release create v2.0.0 \
  --title "GrowAgentAI v2.0.0" \
  --notes "Release notes here" \
  dist/*
```

Or manually:
1. Go to https://github.com/hvilleg-dev/GrowAgentAI/releases
2. Click "New Release"
3. Select tag `v2.0.0`
4. Add title and description
5. Upload files from `dist/`
6. Click "Publish release"

### Essential Files to Upload

- `GrowAgentAI Setup 2.0.0.exe`
- `GrowAgentAI 2.0.0.exe`
- `GrowAgentAI-2.0.0.dmg`
- `GrowAgentAI-2.0.0.AppImage`
- `growagentai_2.0.0_amd64.deb`
- `latest.yml` (for auto-updates)
- `latest-mac.yml` (macOS auto-updates)
- `latest-linux.yml` (Linux auto-updates)

---

## Step 5: Verify Release

### Check Downloads

```bash
# List GitHub releases
gh release list

# Download specific file
gh release download v2.0.0 --pattern "GrowAgentAI*.exe"
```

### Verify Auto-Updates

1. Deploy released version
2. Build and release new version v2.0.1
3. Open app and check for update notification
4. Verify download and restart

---

## Troubleshooting

### Build Fails

```bash
# Clear build cache
rm -rf dist node_modules

# Reinstall dependencies
npm install

# Try building again
npm run dist
```

### Code Signing Error

```bash
# Windows: Check certificate store
certmgr.msc

# macOS: Check Keychain
security find-identity -v -p codesigning

# Verify environment variables
echo $CSC_LINK
echo $APPLE_ID
```

### App Won't Launch After Installation

1. Check console for errors: `npm run dev`
2. Verify React app builds: `cd ../web && npm run build`
3. Check electron main process logs
4. Run dev mode to test

### Update Fails

1. Verify `latest.yml` uploaded to GitHub
2. Check GitHub release API: `curl https://api.github.com/repos/YOUR_ORG/GrowAgentAI/releases/latest`
3. Verify version in manifest matches release

---

## Environment Variables

Create `.env.local` file (gitignored):

```bash
# Windows
CSC_LINK=./certificate.pfx
CSC_KEY_PASSWORD=your-password

# macOS
APPLE_ID=your-email@example.com
APPLE_PASSWORD=your-app-specific-password
APPLE_TEAM_ID=ABCD123EFG

# Linux
CSC_LINK=GPGKEYID
```

---

## Continuous Integration

### GitHub Actions Setup

Create `.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Build
        run: npm run dist
        env:
          CSC_LINK: ${{ secrets.CSC_LINK }}
          CSC_KEY_PASSWORD: ${{ secrets.CSC_KEY_PASSWORD }}
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_PASSWORD: ${{ secrets.APPLE_PASSWORD }}
          APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}

      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: dist/*
```

Set GitHub Secrets:
- `CSC_LINK` - Base64 encoded certificate
- `CSC_KEY_PASSWORD` - Certificate password
- `APPLE_ID` - Apple ID
- `APPLE_PASSWORD` - App-specific password
- `APPLE_TEAM_ID` - Team ID

---

## Distribution Channels

After GitHub release:

### Chocolatey (Windows)
```bash
# Package app
choco pack

# Push to Chocolatey
choco push growagentai.nupkg
```

### Homebrew (macOS)
```bash
# Create formula
brew create growagentai-2.0.0.dmg

# Submit PR to homebrew-casks
```

### Flathub (Linux)
```bash
# Submit to Flathub
# https://flathub.org/
```

### Snap Store (Linux)
```bash
snapcraft push growagentai_2.0.0_amd64.snap
```

---

## Performance Targets

- Build time: < 5 minutes
- Binary size: 150-200MB
- Install time: < 2 minutes
- Memory: 150-200MB
- Auto-update time: < 5 minutes

---

## Rollback Procedure

If release has critical issues:

```bash
# Delete tag
git tag -d v2.0.0
git push origin --delete v2.0.0

# Delete GitHub release
gh release delete v2.0.0

# Fix code and commit
git add -A
git commit -m "fix: critical issue"

# Create new release
git tag v2.0.1
git push origin v2.0.1
```

---

## Release Checklist

- [ ] All tests passing
- [ ] Code reviewed
- [ ] Version bumped in package.json
- [ ] Certificates ready/updated
- [ ] Environment variables set
- [ ] Build succeeds for all platforms
- [ ] Installers tested on each OS
- [ ] App functionality verified
- [ ] API connectivity working
- [ ] Code signed & notarized
- [ ] GitHub release created
- [ ] Artifacts uploaded
- [ ] Auto-update files uploaded
- [ ] Release notes published
- [ ] Update notification works

---

**Ready to release?** Follow these steps in order!

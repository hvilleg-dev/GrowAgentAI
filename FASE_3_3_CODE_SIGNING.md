# FASE 3.3: Code Signing for Distribution

**Status:** 🔄 Setup Guide  
**Date:** November 6, 2026  

---

## Overview

Code signing ensures:
- ✅ Users trust your app (verified origin)
- ✅ Apps can auto-update
- ✅ No "Unknown Publisher" warnings
- ✅ macOS Gatekeeper acceptance
- ✅ Windows SmartScreen trust

---

## Windows Code Signing

### Development (Self-Signed)

```powershell
# Create self-signed certificate
New-SelfSignedCertificate `
  -CertStoreLocation "cert:\CurrentUser\My" `
  -Subject "CN=GrowAgentAI" `
  -KeySpec Signature `
  -KeyLength 2048 `
  -KeyFriendlyName "GrowAgentAI Code Signing" `
  -Provider "Microsoft Enhanced RSA and AES Cryptographic Provider"

# Export as PFX
$cert = Get-ChildItem -Path Cert:\CurrentUser\My | 
  Where-Object {$_.Subject -eq "CN=GrowAgentAI"}

Export-PfxCertificate -Cert $cert `
  -FilePath certificate.pfx `
  -Password (ConvertTo-SecureString -String "password" -AsPlainText -Force)
```

### Production (DigiCert, Sectigo, etc)

1. Purchase code signing certificate
2. Generate CSR
3. Validate ownership
4. Receive certificate
5. Import to local store
6. Configure CI/CD environment variables

### Configuration

Update `package.json`:

```json
{
  "build": {
    "win": {
      "certificateFile": "certificate.pfx",
      "certificatePassword": "${CSC_KEY_PASSWORD}",
      "signingHashAlgorithms": ["sha256"]
    }
  }
}
```

Environment variables:
```bash
export CSC_LINK=certificate.pfx
export CSC_KEY_PASSWORD=your-password
```

---

## macOS Code Signing

### Setup

1. **Register Apple Developer Account**
   - Visit https://developer.apple.com
   - Enroll in Apple Developer Program ($99/year)

2. **Create Certificate**
   - Sign in to Apple Developer
   - Go to Certificates, IDs & Profiles
   - Create "Developer ID Application" certificate

3. **Export Certificate**
   ```bash
   # Certificate appears in Keychain
   # Drag to desktop to export as .p12
   ```

### Configuration

Update `package.json`:

```json
{
  "build": {
    "mac": {
      "identity": "Developer ID Application: Your Name (ABCD123EFG)",
      "certificateFile": "developer-id.p12",
      "certificatePassword": "${CSC_KEY_PASSWORD}",
      "notarize": {
        "teamId": "ABCD123EFG"
      }
    }
  }
}
```

### Notarization (Required for Big Sur+)

Apple requires notarization for all signed apps:

```typescript
// In electron-builder config
const notarize = require('electron-notarize')

module.exports = {
  afterSign: async (context) => {
    if (process.platform !== 'darwin') return

    await notarize.notarize({
      appBundleId: 'com.growagentai.app',
      appPath: `${context.appOutDir}/GrowAgentAI.app`,
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_PASSWORD,
      teamId: process.env.APPLE_TEAM_ID,
    })
  }
}
```

Environment variables:
```bash
export CSC_LINK=developer-id.p12
export CSC_KEY_PASSWORD=password
export APPLE_ID=your@email.com
export APPLE_PASSWORD=app-specific-password
export APPLE_TEAM_ID=ABCD123EFG
```

---

## Linux Code Signing

Most Linux distributions use GPG keys for package signing:

```bash
# Generate GPG key
gpg --full-generate-key

# Export public key
gpg --export -a "your-name" > public.key

# Sign DEB package
dpkg-sig --sign builder dist/growagentai_2.0.0_amd64.deb
```

Update `package.json`:

```json
{
  "build": {
    "linux": {
      "signingKeyFile": "private.key"
    }
  }
}
```

---

## GitHub Actions Setup

### Create `.github/workflows/release.yml`

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
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
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

---

## Environment Variables (GitHub Secrets)

Set in GitHub → Settings → Secrets → Actions:

- `CSC_LINK` - Base64 encoded certificate
- `CSC_KEY_PASSWORD` - Certificate password
- `APPLE_ID` - Apple ID email
- `APPLE_PASSWORD` - App-specific password
- `APPLE_TEAM_ID` - Apple Team ID

---

## Verification

### Windows

```bash
# Check signature
signtool verify /pa /v dist/GrowAgentAI.exe
```

### macOS

```bash
# Check signature
codesign -v dist/GrowAgentAI.app

# Check notarization
spctl -a -v dist/GrowAgentAI.app
```

### Linux

```bash
# Verify GPG signature
dpkg-sig --verify dist/growagentai_2.0.0_amd64.deb
```

---

## Security Checklist

- ✅ Certificates stored in CI/CD secrets
- ✅ Never commit private keys
- ✅ Use app-specific passwords for Apple
- ✅ Rotate certificates annually
- ✅ Monitor for compromised keys
- ✅ Keep signing tools updated

---

## Common Issues

**"Certificate not found"**
```bash
# Windows: Check Cert Store
certmgr.msc

# macOS: Check Keychain
security find-identity -v -p codesigning
```

**"Notarization failed"**
```bash
# Check Apple notarization status
xcrun altool --notarize-app --file app.zip --username $APPLE_ID
```

**"SmartScreen warning still appears"**
- Need to build & sign, then more people download (reputation)
- Takes 1-2 weeks to clear

---

## Timeline

- Day 1-2: Windows self-signed setup & testing
- Day 3: macOS certificate & notarization
- Day 4-5: Linux GPG signing
- Day 6: CI/CD automation
- Day 7: Full release testing

---

**Status:** Ready for implementation  
**Next:** Phase 3.4 - Build & Package  

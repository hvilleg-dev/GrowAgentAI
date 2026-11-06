# FASE 3: Desktop - Electron Implementation
**Dates:** December 4-18, 2026 (2 weeks)  
**Status:** 🔄 Ready to Begin

## Overview

Wrap the React v2.0.0 frontend in Electron to create cross-platform desktop applications for Windows, macOS, and Linux.

## Architecture

```
GrowAgentAI Desktop v2.0.0
├── main/ (Electron Main Process)
│   ├── main.ts - App entry point
│   ├── preload.ts - IPC bridge
│   ├── windows/ - Window managers
│   │   ├── MainWindow.ts
│   │   └── TrayWindow.ts
│   └── handlers/ - IPC handlers
│       ├── fileHandlers.ts
│       ├── updateHandlers.ts
│       └── settingsHandlers.ts
│
├── preload/ (Sandbox Bridge)
│   ├── index.ts - IPC API
│   └── types.ts - Type definitions
│
├── renderer/ (React App)
│   └── [points to frontend/packages/web/dist]
│
├── resources/ (Icons, etc)
│   ├── icon.icns (macOS)
│   ├── icon.ico (Windows)
│   └── app.png (Linux)
│
└── electron-builder.yml (Build config)
```

## Implementation Phases

### Phase 3.1: Electron Setup (Days 1-3)

#### 1. Project Structure
```bash
mkdir -p frontend/packages/desktop/main
mkdir -p frontend/packages/desktop/preload
mkdir -p frontend/packages/desktop/resources
```

#### 2. Package Configuration
```json
{
  "name": "growagentai",
  "version": "2.0.0",
  "type": "module",
  "main": "dist/main/main.js",
  "homepage": "./",
  "author": "GrowAgentAI Team",
  "description": "AI Coaching Platform - Desktop Edition",
  "scripts": {
    "dev": "concurrently \"npm run dev:web\" \"wait-on http://localhost:5173 && electron .\"",
    "dev:web": "cd ../web && vite",
    "build": "npm run build:web && npm run build:electron",
    "build:web": "cd ../web && vite build",
    "build:electron": "tsc && electron-builder",
    "dist": "npm run build"
  },
  "dependencies": {
    "electron-squirrel-startup": "^1.1.0",
    "electron-store": "^8.1.0"
  },
  "devDependencies": {
    "electron": "^27.0.0",
    "electron-builder": "^24.6.0",
    "electron-notarize": "^2.1.0",
    "typescript": "^5.3.3"
  },
  "build": {
    "appId": "com.growagentai.app",
    "productName": "GrowAgentAI",
    "files": [
      "dist/**/*",
      "node_modules/**/*"
    ],
    "directories": {
      "buildResources": "resources"
    }
  }
}
```

#### 3. Main Process (main/main.ts)
```typescript
import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'

let mainWindow: BrowserWindow | null = null

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  // Load from dev server or packaged app
  const startUrl = process.env.ELECTRON_START_URL || 
    `file://${path.join(__dirname, '../../renderer/dist/index.html')}`
  mainWindow.loadURL(startUrl)

  if (process.env.DEBUG) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
```

#### 4. Preload Script (preload/index.ts)
```typescript
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  invoke: (channel: string, ...args: any[]) => 
    ipcRenderer.invoke(channel, ...args),
  on: (channel: string, callback: any) => 
    ipcRenderer.on(channel, callback),
  send: (channel: string, ...args: any[]) =>
    ipcRenderer.send(channel, ...args),
})
```

### Phase 3.2: Auto-Update (Days 4-6)

#### 1. Auto-Updater Setup
```typescript
import { autoUpdater } from 'electron-updater'

autoUpdater.checkForUpdatesAndNotify()
```

#### 2. Update Flow
- Check for updates on app start
- Download updates in background
- Notify user
- Restart to apply

### Phase 3.3: Code Signing (Days 7-8)

#### Windows Code Signing
```bash
# Create self-signed certificate for development
New-SelfSignedCertificate -CertStoreLocation "cert:\LocalMachine\My" `
  -Subject "CN=GrowAgentAI" -Type CodeSigningCert
```

#### macOS Code Signing
```bash
# Use Apple Developer certificate
export CSC_LINK=certificate.p12
export CSC_KEY_PASSWORD=password
```

### Phase 3.4: Build & Package (Days 9-10)

#### Build Targets
- **Windows**: NSIS installer (.exe), portable (.exe)
- **macOS**: DMG, App Store package (.pkg)
- **Linux**: AppImage, Snap, deb

#### electron-builder.yml
```yaml
build:
  appId: com.growagentai.app
  productName: GrowAgentAI

win:
  target:
    - nsis
    - portable
  certificateFile: certificate.pfx

mac:
  target:
    - dmg
    - zip
  category: public.app-category.productivity
  
linux:
  target:
    - AppImage
    - snap
```

## Deliverables

### Code
- ✅ Main process with window management
- ✅ Preload script with IPC bridge
- ✅ Development server integration
- ✅ Auto-updater implementation
- ✅ Code signing for Windows/macOS
- ✅ Build configuration

### Artifacts
- ✅ Windows installer (.exe)
- ✅ macOS DMG
- ✅ Linux AppImage
- ✅ Auto-update server configuration

### Documentation
- ✅ Setup guide for development
- ✅ Build instructions
- ✅ Deployment guide
- ✅ Auto-updater guide

## Timeline

| Phase | Days | Tasks |
|-------|------|-------|
| Setup | 1-3 | Project structure, Electron config, Main process |
| Auto-Update | 4-6 | Update mechanism, notification, restart |
| Code Signing | 7-8 | Windows & macOS signing setup |
| Build/Package | 9-10 | Multi-platform builds, testing |

## Success Criteria

- ✅ Desktop app runs on Windows, macOS, Linux
- ✅ App connects to backend API
- ✅ All React features work unchanged
- ✅ Auto-updates working
- ✅ Code signed for distribution
- ✅ Installers created and tested

## Commands

```bash
# Development
npm run dev                    # Run with dev server + dev tools

# Build
npm run build                  # Build web + desktop
npm run dist                   # Create distributable

# Code signing setup
npm run setup:signing         # Configure certificates

# Testing
npm run test:desktop          # E2E tests for desktop features
```

## Notes

- Reuses 100% of React v2.0.0 frontend code
- Minimal Electron-specific code
- Auto-updater configured for GitHub releases
- Code signing certificates required for release builds

---

**Status:** Ready to begin Phase 3.1 setup

Next session: Execute Phase 3.1 (Electron setup)

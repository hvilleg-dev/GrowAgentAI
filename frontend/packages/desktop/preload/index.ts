import { contextBridge, ipcRenderer } from 'electron'

interface ElectronAPI {
  invoke: (channel: string, ...args: any[]) => Promise<any>
  on: (channel: string, callback: (event: any, ...args: any[]) => void) => void
  send: (channel: string, ...args: any[]) => void
  getVersion: () => Promise<string>
  getAppName: () => Promise<string>
  onUpdateAvailable: (callback: () => void) => void
  onUpdateDownloaded: (callback: () => void) => void
  restartAndInstall: () => Promise<void>
  checkUpdates: () => Promise<any>
}

const electronAPI: ElectronAPI = {
  invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
  on: (channel: string, callback: (event: any, ...args: any[]) => void) =>
    ipcRenderer.on(channel, callback),
  send: (channel: string, ...args: any[]) => ipcRenderer.send(channel, ...args),
  getVersion: () => ipcRenderer.invoke('app:version'),
  getAppName: () => ipcRenderer.invoke('app:name'),
  onUpdateAvailable: (callback: () => void) =>
    ipcRenderer.on('update-available', callback),
  onUpdateDownloaded: (callback: () => void) =>
    ipcRenderer.on('update-downloaded', callback),
  restartAndInstall: () => ipcRenderer.invoke('app:restart-install-update'),
  checkUpdates: () => ipcRenderer.invoke('app:check-updates'),
}

contextBridge.exposeInMainWorld('electron', electronAPI)

declare global {
  interface Window {
    electron: ElectronAPI
  }
}

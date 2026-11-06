import { contextBridge, ipcRenderer } from 'electron'

interface ElectronAPI {
  invoke: (channel: string, ...args: any[]) => Promise<any>
  on: (channel: string, callback: (event: any, ...args: any[]) => void) => void
  send: (channel: string, ...args: any[]) => void
  getVersion: () => Promise<string>
  getAppName: () => Promise<string>
}

const electronAPI: ElectronAPI = {
  invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
  on: (channel: string, callback: (event: any, ...args: any[]) => void) =>
    ipcRenderer.on(channel, callback),
  send: (channel: string, ...args: any[]) => ipcRenderer.send(channel, ...args),
  getVersion: () => ipcRenderer.invoke('app:version'),
  getAppName: () => ipcRenderer.invoke('app:name'),
}

contextBridge.exposeInMainWorld('electron', electronAPI)

declare global {
  interface Window {
    electron: ElectronAPI
  }
}

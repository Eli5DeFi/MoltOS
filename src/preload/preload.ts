import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
const electronAPI = {
  // App information
  getAppVersion: () => ipcRenderer.invoke('app:getVersion'),
  getAppName: () => ipcRenderer.invoke('app:getName'),
  
  // Window controls
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
  
  // File system operations
  readDirectory: (path: string) => ipcRenderer.invoke('fs:readDir', path),
  
  // System information
  platform: process.platform,
  arch: process.arch,
  
  // Environment
  isDevelopment: process.env.NODE_ENV === 'development'
}

// Define the API interface for TypeScript
export interface ElectronAPI {
  getAppVersion: () => Promise<string>
  getAppName: () => Promise<string>
  minimizeWindow: () => Promise<void>
  maximizeWindow: () => Promise<void>
  closeWindow: () => Promise<void>
  readDirectory: (path: string) => Promise<any[]>
  platform: string
  arch: string
  isDevelopment: boolean
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electronAPI', electronAPI)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in global)
  window.electronAPI = electronAPI
}

// Add types to the global window object
declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
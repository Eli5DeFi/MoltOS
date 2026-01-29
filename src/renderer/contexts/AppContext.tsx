import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

export interface AppInfo {
  id: string
  name: string
  displayName: string
  icon: string
  category: 'productivity' | 'developer' | 'communication' | 'system' | 'utility' | 'entertainment'
  version: string
  description: string
  path?: string
  isBuiltIn: boolean
  permissions: string[]
  author?: string
  website?: string
}

export interface WindowState {
  id: string
  appId: string
  title: string
  isMinimized: boolean
  isMaximized: boolean
  isFullscreen: boolean
  isFocused: boolean
  position: { x: number; y: number }
  size: { width: number; height: number }
  zIndex: number
  isResizable: boolean
  isMovable: boolean
  opacity: number
}

interface AppContextType {
  // Apps
  availableApps: AppInfo[]
  installedApps: AppInfo[]
  activeApps: string[]
  
  // Windows
  windows: WindowState[]
  focusedWindow: string | null
  
  // App Management
  launchApp: (appId: string, args?: any) => Promise<string>
  quitApp: (appId: string) => Promise<void>
  installApp: (appPath: string) => Promise<void>
  uninstallApp: (appId: string) => Promise<void>
  getAppInfo: (appId: string) => AppInfo | undefined
  
  // Window Management
  createWindow: (appId: string, options?: Partial<WindowState>) => string
  closeWindow: (windowId: string) => void
  minimizeWindow: (windowId: string) => void
  maximizeWindow: (windowId: string) => void
  restoreWindow: (windowId: string) => void
  focusWindow: (windowId: string) => void
  moveWindow: (windowId: string, position: { x: number; y: number }) => void
  resizeWindow: (windowId: string, size: { width: number; height: number }) => void
  setWindowOpacity: (windowId: string, opacity: number) => void
  
  // Utilities
  getActiveWindows: () => WindowState[]
  getWindowsForApp: (appId: string) => WindowState[]
  isAppRunning: (appId: string) => boolean
}

const AppContext = createContext<AppContextType | undefined>(undefined)

// Built-in apps
const builtInApps: AppInfo[] = [
  {
    id: 'finder',
    name: 'Finder',
    displayName: 'Finder',
    icon: '🗂️',
    category: 'system',
    version: '1.0.0',
    description: 'File manager and browser',
    isBuiltIn: true,
    permissions: ['filesystem.read', 'filesystem.write']
  },
  {
    id: 'terminal',
    name: 'Terminal',
    displayName: 'Terminal',
    icon: '⚫',
    category: 'developer',
    version: '1.0.0',
    description: 'Command line interface',
    isBuiltIn: true,
    permissions: ['system.exec']
  },
  {
    id: 'calculator',
    name: 'Calculator',
    displayName: 'Calculator',
    icon: '🔢',
    category: 'utility',
    version: '1.0.0',
    description: 'Simple calculator app',
    isBuiltIn: true,
    permissions: []
  },
  {
    id: 'settings',
    name: 'System Preferences',
    displayName: 'System Preferences',
    icon: '⚙️',
    category: 'system',
    version: '1.0.0',
    description: 'System configuration and preferences',
    isBuiltIn: true,
    permissions: ['system.config']
  },
  {
    id: 'notes',
    name: 'Notes',
    displayName: 'Notes',
    icon: '📝',
    category: 'productivity',
    version: '1.0.0',
    description: 'Simple note-taking app',
    isBuiltIn: true,
    permissions: ['filesystem.read', 'filesystem.write']
  },
  {
    id: 'moltbot',
    name: 'MoltBot',
    displayName: 'MoltBot Assistant',
    icon: '🤖',
    category: 'productivity',
    version: '1.0.0',
    description: 'AI-powered productivity assistant',
    isBuiltIn: true,
    permissions: ['network.request', 'filesystem.read', 'filesystem.write']
  }
]

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [availableApps] = useState<AppInfo[]>(builtInApps)
  const [installedApps] = useState<AppInfo[]>(builtInApps)
  const [activeApps, setActiveApps] = useState<string[]>([])
  const [windows, setWindows] = useState<WindowState[]>([])
  const [focusedWindow, setFocusedWindow] = useState<string | null>(null)
  const [nextZIndex, setNextZIndex] = useState(1000)

  // App Management
  const launchApp = useCallback(async (appId: string, args?: any): Promise<string> => {
    const app = availableApps.find(a => a.id === appId)
    if (!app) {
      throw new Error(`App ${appId} not found`)
    }

    // Add to active apps if not already active
    if (!activeApps.includes(appId)) {
      setActiveApps(prev => [...prev, appId])
    }

    // Create main window for the app
    const windowId = createWindow(appId, {
      title: app.displayName,
      size: { width: 800, height: 600 },
      position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 }
    })

    // Use native app launch if available
    if (window.moltOS) {
      try {
        await window.moltOS.apps.launch(appId, args)
      } catch (error) {
        console.error(`Failed to launch app ${appId}:`, error)
      }
    }

    return windowId
  }, [availableApps, activeApps])

  const quitApp = useCallback(async (appId: string) => {
    // Close all windows for the app
    const appWindows = windows.filter(w => w.appId === appId)
    appWindows.forEach(window => {
      closeWindow(window.id)
    })

    // Remove from active apps
    setActiveApps(prev => prev.filter(id => id !== appId))

    // Use native app quit if available
    if (window.moltOS) {
      try {
        await window.moltOS.apps.quit(appId)
      } catch (error) {
        console.error(`Failed to quit app ${appId}:`, error)
      }
    }
  }, [windows])

  const installApp = useCallback(async (appPath: string) => {
    if (window.moltOS) {
      await window.moltOS.apps.install(appPath)
    }
  }, [])

  const uninstallApp = useCallback(async (appId: string) => {
    if (window.moltOS) {
      await window.moltOS.apps.uninstall(appId)
    }
  }, [])

  const getAppInfo = useCallback((appId: string): AppInfo | undefined => {
    return availableApps.find(app => app.id === appId)
  }, [availableApps])

  // Window Management
  const createWindow = useCallback((appId: string, options?: Partial<WindowState>): string => {
    const windowId = `${appId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const newWindow: WindowState = {
      id: windowId,
      appId,
      title: options?.title || appId,
      isMinimized: false,
      isMaximized: false,
      isFullscreen: false,
      isFocused: true,
      position: { x: 100, y: 100 },
      size: { width: 800, height: 600 },
      zIndex: nextZIndex,
      isResizable: true,
      isMovable: true,
      opacity: 1,
      ...options
    }

    setWindows(prev => [...prev, newWindow])
    setFocusedWindow(windowId)
    setNextZIndex(prev => prev + 1)

    return windowId
  }, [nextZIndex])

  const closeWindow = useCallback((windowId: string) => {
    setWindows(prev => prev.filter(w => w.id !== windowId))
    
    // If this was the focused window, focus the next highest z-index window
    if (focusedWindow === windowId) {
      const remainingWindows = windows.filter(w => w.id !== windowId && !w.isMinimized)
      if (remainingWindows.length > 0) {
        const nextWindow = remainingWindows.reduce((highest, current) => 
          current.zIndex > highest.zIndex ? current : highest
        )
        setFocusedWindow(nextWindow.id)
      } else {
        setFocusedWindow(null)
      }
    }
  }, [focusedWindow, windows])

  const minimizeWindow = useCallback((windowId: string) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId 
        ? { ...w, isMinimized: true, isFocused: false }
        : w
    ))
    
    if (focusedWindow === windowId) {
      // Focus next available window
      const visibleWindows = windows.filter(w => w.id !== windowId && !w.isMinimized)
      if (visibleWindows.length > 0) {
        const nextWindow = visibleWindows.reduce((highest, current) => 
          current.zIndex > highest.zIndex ? current : highest
        )
        setFocusedWindow(nextWindow.id)
      } else {
        setFocusedWindow(null)
      }
    }
  }, [focusedWindow, windows])

  const maximizeWindow = useCallback((windowId: string) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId 
        ? { ...w, isMaximized: !w.isMaximized, isMinimized: false }
        : w
    ))
  }, [])

  const restoreWindow = useCallback((windowId: string) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId 
        ? { ...w, isMinimized: false, isMaximized: false, isFocused: true }
        : { ...w, isFocused: false }
    ))
    setFocusedWindow(windowId)
  }, [])

  const focusWindow = useCallback((windowId: string) => {
    setWindows(prev => prev.map(w => ({
      ...w,
      isFocused: w.id === windowId,
      zIndex: w.id === windowId ? nextZIndex : w.zIndex
    })))
    setFocusedWindow(windowId)
    setNextZIndex(prev => prev + 1)
  }, [nextZIndex])

  const moveWindow = useCallback((windowId: string, position: { x: number; y: number }) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, position } : w
    ))
  }, [])

  const resizeWindow = useCallback((windowId: string, size: { width: number; height: number }) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, size } : w
    ))
  }, [])

  const setWindowOpacity = useCallback((windowId: string, opacity: number) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, opacity: Math.max(0, Math.min(1, opacity)) } : w
    ))
  }, [])

  // Utilities
  const getActiveWindows = useCallback((): WindowState[] => {
    return windows.filter(w => !w.isMinimized)
  }, [windows])

  const getWindowsForApp = useCallback((appId: string): WindowState[] => {
    return windows.filter(w => w.appId === appId)
  }, [windows])

  const isAppRunning = useCallback((appId: string): boolean => {
    return activeApps.includes(appId)
  }, [activeApps])

  // Global window event handlers
  useEffect(() => {
    const handleGlobalClick = () => {
      // Handle global clicks for window management
    }

    const handleMinimizeAll = () => {
      setWindows(prev => prev.map(w => ({ ...w, isMinimized: true, isFocused: false })))
      setFocusedWindow(null)
    }

    window.addEventListener('click', handleGlobalClick)
    window.addEventListener('moltos:minimize-all-windows', handleMinimizeAll)

    return () => {
      window.removeEventListener('click', handleGlobalClick)
      window.removeEventListener('moltos:minimize-all-windows', handleMinimizeAll)
    }
  }, [])

  const contextValue: AppContextType = {
    availableApps,
    installedApps,
    activeApps,
    windows,
    focusedWindow,
    launchApp,
    quitApp,
    installApp,
    uninstallApp,
    getAppInfo,
    createWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    focusWindow,
    moveWindow,
    resizeWindow,
    setWindowOpacity,
    getActiveWindows,
    getWindowsForApp,
    isAppRunning
  }

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
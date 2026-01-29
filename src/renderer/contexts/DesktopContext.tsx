import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

interface DesktopState {
  wallpaper: string
  isSpotlightOpen: boolean
  showNotifications: boolean
  activeDesktop: number
  desktops: DesktopSpace[]
  hotCorners: HotCorners
  missionControlActive: boolean
}

interface DesktopSpace {
  id: number
  name: string
  apps: string[]
  wallpaper?: string
}

interface HotCorners {
  topLeft: 'none' | 'mission-control' | 'application-windows' | 'desktop' | 'dashboard'
  topRight: 'none' | 'notification-center' | 'quick-note' | 'lock-screen'
  bottomLeft: 'none' | 'launchpad' | 'start-screen-saver'
  bottomRight: 'none' | 'disable-screen-saver' | 'sleep-display'
}

interface DesktopContextType extends DesktopState {
  // Spotlight
  openSpotlight: () => void
  closeSpotlight: () => void
  toggleSpotlight: () => void
  
  // Notifications
  showNotificationCenter: () => void
  hideNotificationCenter: () => void
  toggleNotificationCenter: () => void
  
  // Desktops/Spaces
  switchToDesktop: (id: number) => void
  createDesktop: (name?: string) => number
  removeDesktop: (id: number) => void
  moveAppToDesktop: (appId: string, desktopId: number) => void
  
  // Mission Control
  openMissionControl: () => void
  closeMissionControl: () => void
  
  // Hot Corners
  triggerHotCorner: (corner: keyof HotCorners) => void
  setHotCorner: (corner: keyof HotCorners, action: HotCorners[keyof HotCorners]) => void
  
  // Wallpaper
  setWallpaper: (wallpaper: string) => void
  
  // Utilities
  showDesktop: () => void
  minimizeAllWindows: () => void
}

const DesktopContext = createContext<DesktopContextType | undefined>(undefined)

const defaultDesktops: DesktopSpace[] = [
  { id: 1, name: 'Desktop 1', apps: [] },
  { id: 2, name: 'Desktop 2', apps: [] }
]

const defaultHotCorners: HotCorners = {
  topLeft: 'mission-control',
  topRight: 'notification-center',
  bottomLeft: 'none',
  bottomRight: 'none'
}

export const DesktopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<DesktopState>({
    wallpaper: 'gradient-1',
    isSpotlightOpen: false,
    showNotifications: false,
    activeDesktop: 1,
    desktops: defaultDesktops,
    hotCorners: defaultHotCorners,
    missionControlActive: false
  })

  // Spotlight management
  const openSpotlight = useCallback(() => {
    setState(prev => ({ ...prev, isSpotlightOpen: true }))
  }, [])

  const closeSpotlight = useCallback(() => {
    setState(prev => ({ ...prev, isSpotlightOpen: false }))
  }, [])

  const toggleSpotlight = useCallback(() => {
    setState(prev => ({ ...prev, isSpotlightOpen: !prev.isSpotlightOpen }))
  }, [])

  // Notifications management
  const showNotificationCenter = useCallback(() => {
    setState(prev => ({ ...prev, showNotifications: true }))
  }, [])

  const hideNotificationCenter = useCallback(() => {
    setState(prev => ({ ...prev, showNotifications: false }))
  }, [])

  const toggleNotificationCenter = useCallback(() => {
    setState(prev => ({ ...prev, showNotifications: !prev.showNotifications }))
  }, [])

  // Desktop/Spaces management
  const switchToDesktop = useCallback((id: number) => {
    setState(prev => ({ ...prev, activeDesktop: id }))
  }, [])

  const createDesktop = useCallback((name?: string): number => {
    setState(prev => {
      const newId = Math.max(...prev.desktops.map(d => d.id)) + 1
      const newDesktop: DesktopSpace = {
        id: newId,
        name: name || `Desktop ${newId}`,
        apps: []
      }
      return {
        ...prev,
        desktops: [...prev.desktops, newDesktop]
      }
    })
    return state.desktops.length + 1
  }, [state.desktops.length])

  const removeDesktop = useCallback((id: number) => {
    setState(prev => {
      if (prev.desktops.length <= 1) return prev // Don't remove last desktop
      
      const newDesktops = prev.desktops.filter(d => d.id !== id)
      const newActiveDesktop = prev.activeDesktop === id 
        ? newDesktops[0].id 
        : prev.activeDesktop
      
      return {
        ...prev,
        desktops: newDesktops,
        activeDesktop: newActiveDesktop
      }
    })
  }, [])

  const moveAppToDesktop = useCallback((appId: string, desktopId: number) => {
    setState(prev => ({
      ...prev,
      desktops: prev.desktops.map(desktop => {
        if (desktop.id === desktopId) {
          return {
            ...desktop,
            apps: desktop.apps.includes(appId) 
              ? desktop.apps 
              : [...desktop.apps, appId]
          }
        } else {
          return {
            ...desktop,
            apps: desktop.apps.filter(id => id !== appId)
          }
        }
      })
    }))
  }, [])

  // Mission Control
  const openMissionControl = useCallback(() => {
    setState(prev => ({ ...prev, missionControlActive: true }))
  }, [])

  const closeMissionControl = useCallback(() => {
    setState(prev => ({ ...prev, missionControlActive: false }))
  }, [])

  // Hot Corners
  const triggerHotCorner = useCallback((corner: keyof HotCorners) => {
    const action = state.hotCorners[corner]
    
    switch (action) {
      case 'mission-control':
        openMissionControl()
        break
      case 'notification-center':
        showNotificationCenter()
        break
      case 'application-windows':
        // Show all windows for current app
        break
      case 'desktop':
        showDesktop()
        break
      case 'launchpad':
        // Open Launchpad
        break
      case 'lock-screen':
        // Lock the screen
        break
      case 'sleep-display':
        // Sleep display
        break
    }
  }, [state.hotCorners, openMissionControl, showNotificationCenter])

  const setHotCorner = useCallback((corner: keyof HotCorners, action: HotCorners[keyof HotCorners]) => {
    setState(prev => ({
      ...prev,
      hotCorners: { ...prev.hotCorners, [corner]: action }
    }))
  }, [])

  // Wallpaper
  const setWallpaper = useCallback((wallpaper: string) => {
    setState(prev => ({ ...prev, wallpaper }))
  }, [])

  // Utilities
  const showDesktop = useCallback(() => {
    if (window.moltOS) {
      // Minimize all windows
      window.dispatchEvent(new CustomEvent('moltos:minimize-all-windows'))
    }
  }, [])

  const minimizeAllWindows = useCallback(() => {
    if (window.moltOS) {
      window.dispatchEvent(new CustomEvent('moltos:minimize-all-windows'))
    }
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { metaKey, ctrlKey, key, code } = event
      
      // Command + Space - Spotlight
      if ((metaKey || ctrlKey) && key === ' ') {
        event.preventDefault()
        toggleSpotlight()
      }
      
      // F3 or Control + Up - Mission Control
      if (key === 'F3' || (ctrlKey && key === 'ArrowUp')) {
        event.preventDefault()
        openMissionControl()
      }
      
      // Control + Left/Right - Switch desktops
      if (ctrlKey && (key === 'ArrowLeft' || key === 'ArrowRight')) {
        event.preventDefault()
        const currentIndex = state.desktops.findIndex(d => d.id === state.activeDesktop)
        if (key === 'ArrowLeft' && currentIndex > 0) {
          switchToDesktop(state.desktops[currentIndex - 1].id)
        } else if (key === 'ArrowRight' && currentIndex < state.desktops.length - 1) {
          switchToDesktop(state.desktops[currentIndex + 1].id)
        }
      }
      
      // Escape - Close overlays
      if (key === 'Escape') {
        if (state.isSpotlightOpen) closeSpotlight()
        if (state.missionControlActive) closeMissionControl()
        if (state.showNotifications) hideNotificationCenter()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [state, toggleSpotlight, openMissionControl, switchToDesktop, closeSpotlight, closeMissionControl, hideNotificationCenter])

  // Mouse hot corners detection
  useEffect(() => {
    let hotCornerTimer: NodeJS.Timeout
    
    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event
      const { innerWidth, innerHeight } = window
      const threshold = 5
      
      let corner: keyof HotCorners | null = null
      
      if (clientX <= threshold && clientY <= threshold) {
        corner = 'topLeft'
      } else if (clientX >= innerWidth - threshold && clientY <= threshold) {
        corner = 'topRight'
      } else if (clientX <= threshold && clientY >= innerHeight - threshold) {
        corner = 'bottomLeft'
      } else if (clientX >= innerWidth - threshold && clientY >= innerHeight - threshold) {
        corner = 'bottomRight'
      }
      
      if (corner && state.hotCorners[corner] !== 'none') {
        clearTimeout(hotCornerTimer)
        hotCornerTimer = setTimeout(() => {
          triggerHotCorner(corner!)
        }, 500) // Delay to prevent accidental triggers
      } else {
        clearTimeout(hotCornerTimer)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      clearTimeout(hotCornerTimer)
    }
  }, [state.hotCorners, triggerHotCorner])

  const contextValue: DesktopContextType = {
    ...state,
    openSpotlight,
    closeSpotlight,
    toggleSpotlight,
    showNotificationCenter,
    hideNotificationCenter,
    toggleNotificationCenter,
    switchToDesktop,
    createDesktop,
    removeDesktop,
    moveAppToDesktop,
    openMissionControl,
    closeMissionControl,
    triggerHotCorner,
    setHotCorner,
    setWallpaper,
    showDesktop,
    minimizeAllWindows
  }

  return (
    <DesktopContext.Provider value={contextValue}>
      {children}
    </DesktopContext.Provider>
  )
}

export const useDesktop = () => {
  const context = useContext(DesktopContext)
  if (context === undefined) {
    throw new Error('useDesktop must be used within a DesktopProvider')
  }
  return context
}
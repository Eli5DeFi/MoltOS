import React, { useCallback, useEffect } from 'react'
import { useApp, WindowState } from '../../contexts/AppContext'
import { useTheme } from '../../contexts/ThemeContext'
import Window from './Window'

interface WindowManagerProps {
  apps: string[]
}

const WindowManager: React.FC<WindowManagerProps> = ({ apps }) => {
  const { 
    windows, 
    restoreWindow, 
    focusWindow, 
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    moveWindow,
    resizeWindow
  } = useApp()
  const { currentTheme } = useTheme()

  // Handle window restoration events
  useEffect(() => {
    const handleRestoreWindow = (event: CustomEvent) => {
      const windowId = event.detail
      restoreWindow(windowId)
    }

    window.addEventListener('moltos:restore-window', handleRestoreWindow as EventListener)
    
    return () => {
      window.removeEventListener('moltos:restore-window', handleRestoreWindow as EventListener)
    }
  }, [restoreWindow])

  // Handle keyboard shortcuts for window management
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { metaKey, ctrlKey, key, shiftKey } = event
      
      // Command + W - Close window
      if ((metaKey || ctrlKey) && key === 'w') {
        const focusedWindow = windows.find(w => w.isFocused)
        if (focusedWindow) {
          event.preventDefault()
          closeWindow(focusedWindow.id)
        }
      }
      
      // Command + M - Minimize window
      if ((metaKey || ctrlKey) && key === 'm') {
        const focusedWindow = windows.find(w => w.isFocused)
        if (focusedWindow) {
          event.preventDefault()
          minimizeWindow(focusedWindow.id)
        }
      }
      
      // Command + Tab - Cycle through windows
      if ((metaKey || ctrlKey) && key === 'Tab') {
        event.preventDefault()
        const visibleWindows = windows.filter(w => !w.isMinimized)
        if (visibleWindows.length > 1) {
          const currentIndex = visibleWindows.findIndex(w => w.isFocused)
          const nextIndex = shiftKey 
            ? (currentIndex - 1 + visibleWindows.length) % visibleWindows.length
            : (currentIndex + 1) % visibleWindows.length
          focusWindow(visibleWindows[nextIndex].id)
        }
      }
      
      // Command + ` - Cycle through windows of current app
      if ((metaKey || ctrlKey) && key === '`') {
        event.preventDefault()
        const focusedWindow = windows.find(w => w.isFocused)
        if (focusedWindow) {
          const appWindows = windows.filter(w => w.appId === focusedWindow.appId && !w.isMinimized)
          if (appWindows.length > 1) {
            const currentIndex = appWindows.findIndex(w => w.id === focusedWindow.id)
            const nextIndex = (currentIndex + 1) % appWindows.length
            focusWindow(appWindows[nextIndex].id)
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [windows, closeWindow, minimizeWindow, focusWindow])

  const handleWindowAction = useCallback((windowId: string, action: string, data?: any) => {
    switch (action) {
      case 'close':
        closeWindow(windowId)
        break
      case 'minimize':
        minimizeWindow(windowId)
        break
      case 'maximize':
        maximizeWindow(windowId)
        break
      case 'focus':
        focusWindow(windowId)
        break
      case 'move':
        if (data) {
          moveWindow(windowId, data)
        }
        break
      case 'resize':
        if (data) {
          resizeWindow(windowId, data)
        }
        break
    }
  }, [closeWindow, minimizeWindow, maximizeWindow, focusWindow, moveWindow, resizeWindow])

  // Sort windows by z-index for proper rendering order
  const sortedWindows = [...windows].sort((a, b) => a.zIndex - b.zIndex)

  return (
    <div className={`window-manager ${currentTheme}`}>
      {sortedWindows.map(window => (
        <Window
          key={window.id}
          window={window}
          onAction={handleWindowAction}
        />
      ))}

      <style jsx>{`
        .window-manager {
          position: absolute;
          top: 24px; /* Below menu bar */
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 1000;
        }

        .window-manager > :global(*) {
          pointer-events: auto;
        }
      `}</style>
    </div>
  )
}

export default WindowManager
import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useApp } from '../../contexts/AppContext'
import { useDesktop } from '../../contexts/DesktopContext'
import { useTheme } from '../../contexts/ThemeContext'

interface DockItem {
  id: string
  appId: string
  name: string
  icon: string
  isRunning: boolean
  hasWindows: boolean
  isPersistent: boolean
}

const Dock: React.FC = () => {
  const { availableApps, activeApps, launchApp, quitApp, windows, focusWindow } = useApp()
  const { currentTheme } = useTheme()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(true)
  const dockRef = useRef<HTMLDivElement>(null)

  // Persistent dock items (always shown even when not running)
  const persistentItems = ['finder', 'moltbot', 'terminal', 'calculator', 'settings']
  
  // Create dock items
  const dockItems: DockItem[] = [
    ...persistentItems.map(appId => {
      const app = availableApps.find(a => a.id === appId)
      return {
        id: `dock-${appId}`,
        appId,
        name: app?.displayName || appId,
        icon: app?.icon || '📱',
        isRunning: activeApps.includes(appId),
        hasWindows: windows.some(w => w.appId === appId && !w.isMinimized),
        isPersistent: true
      }
    }),
    // Add non-persistent running apps
    ...activeApps
      .filter(appId => !persistentItems.includes(appId))
      .map(appId => {
        const app = availableApps.find(a => a.id === appId)
        return {
          id: `dock-${appId}`,
          appId,
          name: app?.displayName || appId,
          icon: app?.icon || '📱',
          isRunning: true,
          hasWindows: windows.some(w => w.appId === appId && !w.isMinimized),
          isPersistent: false
        }
      })
  ]

  const handleItemClick = useCallback((item: DockItem) => {
    if (item.isRunning) {
      // If app is running, focus or show its windows
      const appWindows = windows.filter(w => w.appId === item.appId)
      
      if (appWindows.length === 0) {
        // No windows, launch new instance
        launchApp(item.appId)
      } else {
        const visibleWindows = appWindows.filter(w => !w.isMinimized)
        
        if (visibleWindows.length === 0) {
          // All windows are minimized, restore the first one
          const firstWindow = appWindows[0]
          // Dispatch restore window event
          window.dispatchEvent(new CustomEvent('moltos:restore-window', { 
            detail: firstWindow.id 
          }))
        } else {
          // Focus the most recently used window
          const focusedWindow = visibleWindows.reduce((latest, current) => 
            current.zIndex > latest.zIndex ? current : latest
          )
          focusWindow(focusedWindow.id)
        }
      }
    } else {
      // Launch the app
      launchApp(item.appId)
    }
  }, [windows, launchApp, focusWindow])

  const handleItemRightClick = useCallback((item: DockItem, event: React.MouseEvent) => {
    event.preventDefault()
    
    // Create context menu for dock item
    const contextMenu = [
      { label: 'Show in Finder', action: () => {} },
      { label: 'Options', submenu: [
        { label: 'Keep in Dock', checked: item.isPersistent, action: () => {} },
        { label: 'Open at Login', checked: false, action: () => {} }
      ]},
      { separator: true },
    ]
    
    if (item.isRunning) {
      contextMenu.push({ label: 'Quit', action: () => quitApp(item.appId) })
    }
    
    // Show context menu (would need a context menu component)
    console.log('Context menu for', item.name, contextMenu)
  }, [quitApp])

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (dockRef.current) {
      const rect = dockRef.current.getBoundingClientRect()
      setMousePosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      })
    }
  }, [])

  const calculateItemScale = useCallback((itemIndex: number) => {
    if (!hoveredItem || !dockRef.current) return 1
    
    const dockRect = dockRef.current.getBoundingClientRect()
    const itemWidth = 64 // Base item width
    const itemSpacing = 8
    const totalItemWidth = itemWidth + itemSpacing
    
    const hoveredIndex = dockItems.findIndex(item => item.id === hoveredItem)
    if (hoveredIndex === -1) return 1
    
    const distance = Math.abs(itemIndex - hoveredIndex)
    const maxScale = 2.0
    const falloff = 0.3
    
    if (distance === 0) return maxScale
    if (distance === 1) return 1.5
    if (distance === 2) return 1.2
    return 1
  }, [hoveredItem, dockItems])

  // Auto-hide dock when not in use
  useEffect(() => {
    let hideTimer: NodeJS.Timeout
    
    const handleMouseMove = (event: MouseEvent) => {
      const isNearDock = event.clientY > window.innerHeight - 120
      
      if (isNearDock) {
        setIsVisible(true)
        clearTimeout(hideTimer)
      } else {
        clearTimeout(hideTimer)
        hideTimer = setTimeout(() => {
          setIsVisible(false)
        }, 2000)
      }
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      clearTimeout(hideTimer)
    }
  }, [])

  return (
    <div 
      className={`dock-container ${isVisible ? 'visible' : 'hidden'} ${currentTheme}`}
    >
      <div 
        ref={dockRef}
        className="dock"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          setHoveredItem(null)
          setMousePosition({ x: 0, y: 0 })
        }}
      >
        {dockItems.map((item, index) => {
          const scale = calculateItemScale(index)
          const isHovered = hoveredItem === item.id
          
          return (
            <div
              key={item.id}
              className={`dock-item ${item.isRunning ? 'running' : ''} ${isHovered ? 'hovered' : ''}`}
              style={{
                transform: `scale(${scale})`,
                zIndex: isHovered ? 1000 : 1
              }}
              onClick={() => handleItemClick(item)}
              onContextMenu={(e) => handleItemRightClick(item, e)}
              onMouseEnter={() => setHoveredItem(item.id)}
              title={item.name}
            >
              <div className="item-icon">
                {item.icon}
              </div>
              
              {/* Running indicator */}
              {item.isRunning && (
                <div className={`running-indicator ${item.hasWindows ? 'active' : 'minimized'}`} />
              )}
              
              {/* Tooltip */}
              {isHovered && (
                <div className="tooltip">
                  {item.name}
                </div>
              )}
            </div>
          )
        })}
        
        {/* Trash */}
        <div className="dock-separator" />
        <div
          className="dock-item trash"
          title="Trash"
        >
          <div className="item-icon">🗑️</div>
        </div>
      </div>

      <style jsx>{`
        .dock-container {
          position: fixed;
          bottom: 8px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 9999;
          transition: opacity 0.3s ease, transform 0.3s ease;
          pointer-events: auto;
        }

        .dock-container.hidden {
          opacity: 0;
          transform: translateX(-50%) translateY(20px);
          pointer-events: none;
        }

        .dock {
          display: flex;
          align-items: end;
          gap: 8px;
          padding: 8px 16px;
          background: var(--dock-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 16px;
          border: 1px solid var(--window-border);
          box-shadow: var(--shadow-window);
          user-select: none;
        }

        .dock-item {
          position: relative;
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border-radius: 12px;
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          transform-origin: bottom center;
          background: rgba(255, 255, 255, 0.1);
        }

        .dock-item:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .dock-item.running {
          background: rgba(0, 122, 255, 0.2);
        }

        .item-icon {
          font-size: 32px;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
          transition: transform 0.2s ease;
        }

        .dock-item:hover .item-icon {
          transform: scale(1.1);
        }

        .running-indicator {
          position: absolute;
          bottom: -4px;
          left: 50%;
          transform: translateX(-50%);
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent-color);
          opacity: 0.8;
        }

        .running-indicator.minimized {
          background: var(--text-secondary);
          opacity: 0.6;
        }

        .tooltip {
          position: absolute;
          bottom: 80px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          white-space: nowrap;
          pointer-events: none;
          z-index: 1001;
          animation: tooltipAppear 0.2s ease-out;
        }

        .dock-separator {
          width: 1px;
          height: 48px;
          background: var(--window-border);
          margin: 0 4px;
          align-self: center;
        }

        .trash {
          opacity: 0.6;
        }

        .trash:hover {
          opacity: 1;
          background: rgba(255, 59, 48, 0.2);
        }

        @keyframes tooltipAppear {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        /* Dark theme adjustments */
        .dock-container.dark .dock-item {
          background: rgba(255, 255, 255, 0.05);
        }

        .dock-container.dark .dock-item:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .dock-container.dark .dock-item.running {
          background: rgba(10, 132, 255, 0.3);
        }

        /* Responsive scaling */
        @media (max-width: 768px) {
          .dock-item {
            width: 48px;
            height: 48px;
          }

          .item-icon {
            font-size: 24px;
          }

          .dock {
            gap: 4px;
            padding: 4px 12px;
          }
        }

        /* Magnification effect */
        .dock-item {
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        /* Bounce animation for newly launched apps */
        .dock-item.launching {
          animation: bounce 0.6s ease-in-out;
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0) scale(1);
          }
          40% {
            transform: translateY(-10px) scale(1.1);
          }
          60% {
            transform: translateY(-5px) scale(1.05);
          }
        }
      `}</style>
    </div>
  )
}

export default Dock
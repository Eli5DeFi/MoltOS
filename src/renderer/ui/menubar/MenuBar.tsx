import React, { useState, useCallback, useEffect } from 'react'
import { useDesktop } from '../../contexts/DesktopContext'
import { useApp } from '../../contexts/AppContext'
import { useTheme } from '../../contexts/ThemeContext'

interface MenuBarProps {}

const MenuBar: React.FC<MenuBarProps> = () => {
  const { openSpotlight, toggleNotificationCenter, activeDesktop } = useDesktop()
  const { activeApps, focusedWindow, windows, getAppInfo } = useApp()
  const { currentTheme, toggleTheme } = useTheme()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])

  // Get focused app info
  const focusedApp = focusedWindow 
    ? windows.find(w => w.id === focusedWindow)?.appId 
    : null
  const focusedAppInfo = focusedApp ? getAppInfo(focusedApp) : null

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }).format(date)
  }

  const handleMenuClick = useCallback((menuId: string) => {
    setActiveMenu(activeMenu === menuId ? null : menuId)
  }, [activeMenu])

  const handleGlobalClick = useCallback(() => {
    setActiveMenu(null)
  }, [])

  useEffect(() => {
    document.addEventListener('click', handleGlobalClick)
    return () => document.removeEventListener('click', handleGlobalClick)
  }, [handleGlobalClick])

  return (
    <div className={`menubar ${currentTheme}`}>
      {/* Left Section - Apple Menu & App Menus */}
      <div className="menubar-left">
        <div 
          className={`menu-item apple-menu ${activeMenu === 'apple' ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            handleMenuClick('apple')
          }}
        >
          🍎
        </div>
        
        {focusedAppInfo && (
          <>
            <div 
              className={`menu-item app-name ${activeMenu === 'app' ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation()
                handleMenuClick('app')
              }}
            >
              {focusedAppInfo.displayName}
            </div>
            
            <div 
              className={`menu-item ${activeMenu === 'file' ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation()
                handleMenuClick('file')
              }}
            >
              File
            </div>
            
            <div 
              className={`menu-item ${activeMenu === 'edit' ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation()
                handleMenuClick('edit')
              }}
            >
              Edit
            </div>
            
            <div 
              className={`menu-item ${activeMenu === 'view' ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation()
                handleMenuClick('view')
              }}
            >
              View
            </div>
            
            <div 
              className={`menu-item ${activeMenu === 'window' ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation()
                handleMenuClick('window')
              }}
            >
              Window
            </div>
            
            <div 
              className={`menu-item ${activeMenu === 'help' ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation()
                handleMenuClick('help')
              }}
            >
              Help
            </div>
          </>
        )}
      </div>

      {/* Right Section - System Status */}
      <div className="menubar-right">
        <div className="menu-item" onClick={toggleTheme} title="Toggle Theme">
          {currentTheme === 'dark' ? '☀️' : '🌙'}
        </div>
        
        <div className="menu-item" title="Battery">
          🔋
        </div>
        
        <div className="menu-item" title="WiFi">
          📶
        </div>
        
        <div className="menu-item" onClick={openSpotlight} title="Spotlight Search">
          🔍
        </div>
        
        <div 
          className="menu-item notification-center" 
          onClick={toggleNotificationCenter}
          title="Notification Center"
        >
          🔔
        </div>
        
        <div className="menu-item time-display" title={formatDate(currentTime)}>
          <div className="time">{formatTime(currentTime)}</div>
          <div className="date">{formatDate(currentTime)}</div>
        </div>
      </div>

      {/* Dropdown Menus */}
      {activeMenu === 'apple' && (
        <div className="dropdown-menu apple-dropdown">
          <div className="menu-section">
            <div className="menu-option">About This Mac</div>
            <div className="menu-separator" />
            <div className="menu-option">System Preferences...</div>
            <div className="menu-option">App Store...</div>
          </div>
          <div className="menu-section">
            <div className="menu-option">Recent Items</div>
            <div className="menu-separator" />
            <div className="menu-option">Force Quit Applications...</div>
          </div>
          <div className="menu-section">
            <div className="menu-option">Sleep</div>
            <div className="menu-option">Restart...</div>
            <div className="menu-option">Shut Down...</div>
            <div className="menu-separator" />
            <div className="menu-option">Lock Screen</div>
            <div className="menu-option">Log Out...</div>
          </div>
        </div>
      )}

      {activeMenu === 'file' && focusedAppInfo && (
        <div className="dropdown-menu file-dropdown">
          <div className="menu-option">New</div>
          <div className="menu-option">Open...</div>
          <div className="menu-separator" />
          <div className="menu-option">Save</div>
          <div className="menu-option">Save As...</div>
          <div className="menu-separator" />
          <div className="menu-option">Close</div>
        </div>
      )}

      <style jsx>{`
        .menubar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 24px;
          background: var(--menubar-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 8px;
          font-size: 13px;
          font-weight: 400;
          color: var(--text-primary);
          z-index: 10000;
          border-bottom: 1px solid var(--window-border);
          user-select: none;
        }

        .menubar-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .menubar-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .menu-item {
          padding: 2px 8px;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.15s ease;
          white-space: nowrap;
        }

        .menu-item:hover {
          background-color: var(--accent-color);
          color: white;
        }

        .menu-item.active {
          background-color: var(--accent-color);
          color: white;
        }

        .apple-menu {
          font-size: 14px;
          padding: 2px 6px;
        }

        .app-name {
          font-weight: 600;
        }

        .time-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0 6px;
          min-width: 60px;
          text-align: center;
        }

        .time {
          font-size: 13px;
          line-height: 1;
        }

        .date {
          font-size: 10px;
          line-height: 1;
          opacity: 0.8;
        }

        .dropdown-menu {
          position: absolute;
          top: 24px;
          background: var(--window-bg);
          border: 1px solid var(--window-border);
          border-radius: 8px;
          box-shadow: var(--shadow-menu);
          padding: 4px 0;
          min-width: 200px;
          z-index: 11000;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .apple-dropdown {
          left: 8px;
        }

        .file-dropdown {
          left: 80px;
        }

        .menu-section {
          padding: 4px 0;
        }

        .menu-option {
          padding: 4px 16px;
          cursor: pointer;
          transition: background-color 0.15s ease;
        }

        .menu-option:hover {
          background-color: var(--accent-color);
          color: white;
        }

        .menu-separator {
          height: 1px;
          background-color: var(--window-border);
          margin: 4px 0;
        }

        /* Dark theme adjustments */
        .menubar.dark {
          border-bottom-color: rgba(255, 255, 255, 0.1);
        }

        /* Animation for dropdown menus */
        .dropdown-menu {
          animation: menuAppear 0.15s ease-out;
          transform-origin: top;
        }

        @keyframes menuAppear {
          from {
            opacity: 0;
            transform: scaleY(0.8);
          }
          to {
            opacity: 1;
            transform: scaleY(1);
          }
        }

        /* Status indicators */
        .notification-center {
          position: relative;
        }

        .notification-center::after {
          content: '';
          position: absolute;
          top: 2px;
          right: 2px;
          width: 6px;
          height: 6px;
          background: #ff3b30;
          border-radius: 50%;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .notification-center.has-notifications::after {
          opacity: 1;
        }
      `}</style>
    </div>
  )
}

export default MenuBar
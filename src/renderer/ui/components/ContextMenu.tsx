import React, { useState, useEffect, useCallback } from 'react'
import { useTheme } from '../../contexts/ThemeContext'

interface ContextMenuOption {
  id: string
  label: string
  icon?: string
  shortcut?: string
  disabled?: boolean
  separator?: boolean
  submenu?: ContextMenuOption[]
  action?: () => void
}

interface ContextMenuState {
  isVisible: boolean
  x: number
  y: number
  options: ContextMenuOption[]
}

const ContextMenu: React.FC = () => {
  const { currentTheme } = useTheme()
  const [menuState, setMenuState] = useState<ContextMenuState>({
    isVisible: false,
    x: 0,
    y: 0,
    options: []
  })
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null)

  const showContextMenu = useCallback((event: MouseEvent, options: ContextMenuOption[]) => {
    event.preventDefault()
    
    const { clientX, clientY } = event
    const menuWidth = 200
    const menuHeight = options.length * 32 + 16
    
    // Adjust position to keep menu in viewport
    const x = clientX + menuWidth > window.innerWidth 
      ? clientX - menuWidth 
      : clientX
    const y = clientY + menuHeight > window.innerHeight 
      ? clientY - menuHeight 
      : clientY

    setMenuState({
      isVisible: true,
      x: Math.max(8, x),
      y: Math.max(8, y),
      options
    })
  }, [])

  const hideContextMenu = useCallback(() => {
    setMenuState(prev => ({ ...prev, isVisible: false }))
    setActiveSubmenu(null)
  }, [])

  const handleOptionClick = useCallback((option: ContextMenuOption) => {
    if (option.disabled) return
    
    if (option.submenu) {
      setActiveSubmenu(activeSubmenu === option.id ? null : option.id)
      return
    }
    
    if (option.action) {
      option.action()
    }
    
    hideContextMenu()
  }, [activeSubmenu, hideContextMenu])

  // Handle right-click events globally
  useEffect(() => {
    const handleContextMenu = (event: MouseEvent) => {
      const target = event.target as Element
      
      // Default desktop context menu
      if (target.classList.contains('desktop')) {
        const options: ContextMenuOption[] = [
          {
            id: 'new-folder',
            label: 'New Folder',
            icon: '📁',
            action: () => console.log('New folder')
          },
          {
            id: 'paste',
            label: 'Paste',
            icon: '📋',
            shortcut: '⌘V',
            disabled: true,
            action: () => console.log('Paste')
          },
          { id: 'sep1', label: '', separator: true },
          {
            id: 'sort',
            label: 'Sort By',
            icon: '🔤',
            submenu: [
              { id: 'sort-name', label: 'Name', action: () => console.log('Sort by name') },
              { id: 'sort-date', label: 'Date Modified', action: () => console.log('Sort by date') },
              { id: 'sort-size', label: 'Size', action: () => console.log('Sort by size') }
            ]
          },
          {
            id: 'view',
            label: 'View Options',
            icon: '👁️',
            submenu: [
              { id: 'view-icons', label: 'Icons', action: () => console.log('View icons') },
              { id: 'view-list', label: 'List', action: () => console.log('View list') },
              { id: 'view-columns', label: 'Columns', action: () => console.log('View columns') }
            ]
          },
          { id: 'sep2', label: '', separator: true },
          {
            id: 'wallpaper',
            label: 'Change Wallpaper...',
            icon: '🖼️',
            action: () => console.log('Change wallpaper')
          },
          {
            id: 'display',
            label: 'Display Preferences...',
            icon: '🖥️',
            action: () => console.log('Display preferences')
          }
        ]
        
        showContextMenu(event, options)
      }
      
      // Dock item context menu
      if (target.closest('.dock-item')) {
        const options: ContextMenuOption[] = [
          {
            id: 'show-in-finder',
            label: 'Show in Finder',
            action: () => console.log('Show in finder')
          },
          { id: 'sep1', label: '', separator: true },
          {
            id: 'options',
            label: 'Options',
            submenu: [
              { id: 'keep-in-dock', label: 'Keep in Dock', action: () => console.log('Keep in dock') },
              { id: 'open-at-login', label: 'Open at Login', action: () => console.log('Open at login') }
            ]
          },
          { id: 'sep2', label: '', separator: true },
          {
            id: 'quit',
            label: 'Quit',
            action: () => console.log('Quit app')
          }
        ]
        
        showContextMenu(event, options)
      }
      
      // Window title bar context menu
      if (target.closest('.title-bar')) {
        const options: ContextMenuOption[] = [
          {
            id: 'minimize',
            label: 'Minimize',
            shortcut: '⌘M',
            action: () => console.log('Minimize window')
          },
          {
            id: 'zoom',
            label: 'Zoom',
            action: () => console.log('Zoom window')
          },
          { id: 'sep1', label: '', separator: true },
          {
            id: 'move-to-desktop',
            label: 'Move to Desktop',
            submenu: [
              { id: 'desktop-1', label: 'Desktop 1', action: () => console.log('Move to desktop 1') },
              { id: 'desktop-2', label: 'Desktop 2', action: () => console.log('Move to desktop 2') }
            ]
          }
        ]
        
        showContextMenu(event, options)
      }
    }

    // Handle clicks to hide menu
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.context-menu')) {
        hideContextMenu()
      }
    }

    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('click', handleClick)
    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('click', handleClick)
    }
  }, [showContextMenu, hideContextMenu])

  // Handle keyboard navigation
  useEffect(() => {
    if (!menuState.isVisible) return

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          hideContextMenu()
          break
        case 'ArrowDown':
          // Navigate down (would need selected state)
          break
        case 'ArrowUp':
          // Navigate up (would need selected state)
          break
        case 'ArrowRight':
          // Open submenu (would need selected state)
          break
        case 'ArrowLeft':
          // Close submenu
          setActiveSubmenu(null)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [menuState.isVisible, hideContextMenu])

  if (!menuState.isVisible) return null

  return (
    <div 
      className={`context-menu ${currentTheme}`}
      style={{
        left: menuState.x,
        top: menuState.y
      }}
    >
      {menuState.options.map((option, index) => (
        <div key={option.id || index}>
          {option.separator ? (
            <div className="menu-separator" />
          ) : (
            <div
              className={`menu-option ${option.disabled ? 'disabled' : ''} ${
                activeSubmenu === option.id ? 'active' : ''
              }`}
              onClick={() => handleOptionClick(option)}
            >
              {option.icon && (
                <span className="option-icon">{option.icon}</span>
              )}
              <span className="option-label">{option.label}</span>
              {option.shortcut && (
                <span className="option-shortcut">{option.shortcut}</span>
              )}
              {option.submenu && (
                <span className="submenu-arrow">▶</span>
              )}
            </div>
          )}
          
          {/* Submenu */}
          {option.submenu && activeSubmenu === option.id && (
            <div 
              className="submenu"
              style={{
                left: '100%',
                top: index * 32
              }}
            >
              {option.submenu.map((subOption, subIndex) => (
                <div key={subOption.id || subIndex}>
                  {subOption.separator ? (
                    <div className="menu-separator" />
                  ) : (
                    <div
                      className={`menu-option ${subOption.disabled ? 'disabled' : ''}`}
                      onClick={() => handleOptionClick(subOption)}
                    >
                      {subOption.icon && (
                        <span className="option-icon">{subOption.icon}</span>
                      )}
                      <span className="option-label">{subOption.label}</span>
                      {subOption.shortcut && (
                        <span className="option-shortcut">{subOption.shortcut}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <style jsx>{`
        .context-menu {
          position: fixed;
          background: var(--window-bg);
          border: 1px solid var(--window-border);
          border-radius: 8px;
          box-shadow: var(--shadow-menu);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          padding: 4px 0;
          min-width: 180px;
          z-index: 25000;
          animation: contextMenuAppear 0.15s ease-out;
          user-select: none;
        }

        .menu-option {
          display: flex;
          align-items: center;
          padding: 6px 12px;
          cursor: pointer;
          font-size: 13px;
          color: var(--text-primary);
          transition: background-color 0.15s ease;
          position: relative;
          gap: 8px;
        }

        .menu-option:hover:not(.disabled) {
          background: var(--accent-color);
          color: white;
        }

        .menu-option.active {
          background: var(--accent-color);
          color: white;
        }

        .menu-option.disabled {
          color: var(--text-secondary);
          cursor: default;
          opacity: 0.5;
        }

        .option-icon {
          font-size: 14px;
          width: 16px;
          text-align: center;
          flex-shrink: 0;
        }

        .option-label {
          flex: 1;
        }

        .option-shortcut {
          font-size: 11px;
          opacity: 0.7;
          flex-shrink: 0;
        }

        .submenu-arrow {
          font-size: 10px;
          opacity: 0.7;
          flex-shrink: 0;
          margin-left: auto;
        }

        .menu-separator {
          height: 1px;
          background: var(--window-border);
          margin: 4px 0;
        }

        .submenu {
          position: absolute;
          background: var(--window-bg);
          border: 1px solid var(--window-border);
          border-radius: 8px;
          box-shadow: var(--shadow-menu);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          padding: 4px 0;
          min-width: 160px;
          z-index: 26000;
          animation: submenuAppear 0.15s ease-out;
        }

        @keyframes contextMenuAppear {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-4px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes submenuAppear {
          from {
            opacity: 0;
            transform: scale(0.95) translateX(-8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateX(0);
          }
        }
      `}</style>
    </div>
  )
}

export default ContextMenu
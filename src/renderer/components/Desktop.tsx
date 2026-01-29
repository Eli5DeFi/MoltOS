import React, { useCallback, useRef, useState } from 'react'
import { useDesktop } from '../contexts/DesktopContext'
import { useApp } from '../contexts/AppContext'
import { useTheme } from '../contexts/ThemeContext'

interface DesktopIcon {
  id: string
  name: string
  icon: string
  position: { x: number; y: number }
  type: 'app' | 'folder' | 'file'
  path?: string
  appId?: string
}

const Desktop: React.FC = () => {
  const { wallpaper, activeDesktop } = useDesktop()
  const { launchApp } = useApp()
  const { currentTheme } = useTheme()
  const [selectedIcons, setSelectedIcons] = useState<string[]>([])
  const [dragSelection, setDragSelection] = useState<{ start: { x: number; y: number }; current: { x: number; y: number } } | null>(null)
  const desktopRef = useRef<HTMLDivElement>(null)

  // Desktop icons (could be loaded from user preferences)
  const [desktopIcons] = useState<DesktopIcon[]>([
    {
      id: 'moltbot-desktop',
      name: 'MoltBot',
      icon: '🤖',
      position: { x: 50, y: 50 },
      type: 'app',
      appId: 'moltbot'
    },
    {
      id: 'finder-desktop',
      name: 'Finder',
      icon: '🗂️',
      position: { x: 50, y: 150 },
      type: 'app',
      appId: 'finder'
    },
    {
      id: 'terminal-desktop',
      name: 'Terminal',
      icon: '⚫',
      position: { x: 50, y: 250 },
      type: 'app',
      appId: 'terminal'
    }
  ])

  const handleIconClick = useCallback((icon: DesktopIcon, event: React.MouseEvent) => {
    event.stopPropagation()
    
    if (event.detail === 2) {
      // Double click - launch app
      if (icon.type === 'app' && icon.appId) {
        launchApp(icon.appId)
      }
    } else {
      // Single click - select
      if (event.metaKey || event.ctrlKey) {
        setSelectedIcons(prev => 
          prev.includes(icon.id) 
            ? prev.filter(id => id !== icon.id)
            : [...prev, icon.id]
        )
      } else {
        setSelectedIcons([icon.id])
      }
    }
  }, [launchApp])

  const handleDesktopClick = useCallback((event: React.MouseEvent) => {
    if (event.target === desktopRef.current) {
      setSelectedIcons([])
    }
  }, [])

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (event.target === desktopRef.current) {
      const rect = desktopRef.current!.getBoundingClientRect()
      const start = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      }
      setDragSelection({ start, current: start })
    }
  }, [])

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (dragSelection) {
      const rect = desktopRef.current!.getBoundingClientRect()
      const current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      }
      setDragSelection(prev => prev ? { ...prev, current } : null)
    }
  }, [dragSelection])

  const handleMouseUp = useCallback(() => {
    if (dragSelection) {
      // Select icons within selection rectangle
      const selectionRect = {
        left: Math.min(dragSelection.start.x, dragSelection.current.x),
        top: Math.min(dragSelection.start.y, dragSelection.current.y),
        right: Math.max(dragSelection.start.x, dragSelection.current.x),
        bottom: Math.max(dragSelection.start.y, dragSelection.current.y)
      }
      
      const selectedIds = desktopIcons
        .filter(icon => {
          const iconRect = {
            left: icon.position.x,
            top: icon.position.y,
            right: icon.position.x + 64,
            bottom: icon.position.y + 80
          }
          
          return iconRect.left < selectionRect.right &&
                 iconRect.right > selectionRect.left &&
                 iconRect.top < selectionRect.bottom &&
                 iconRect.bottom > selectionRect.top
        })
        .map(icon => icon.id)
      
      setSelectedIcons(selectedIds)
      setDragSelection(null)
    }
  }, [dragSelection, desktopIcons])

  const getWallpaperStyle = () => {
    switch (wallpaper) {
      case 'gradient-1':
        return { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
      case 'gradient-2':
        return { background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }
      case 'gradient-3':
        return { background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }
      case 'solid-blue':
        return { background: '#007AFF' }
      case 'solid-purple':
        return { background: '#5856D6' }
      default:
        return { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
    }
  }

  return (
    <div
      ref={desktopRef}
      className={`desktop ${currentTheme}`}
      style={getWallpaperStyle()}
      onClick={handleDesktopClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Desktop Icons */}
      {desktopIcons.map(icon => (
        <div
          key={icon.id}
          className={`desktop-icon ${selectedIcons.includes(icon.id) ? 'selected' : ''}`}
          style={{
            left: icon.position.x,
            top: icon.position.y
          }}
          onClick={(e) => handleIconClick(icon, e)}
        >
          <div className="icon-image">
            {icon.icon}
          </div>
          <div className="icon-name">
            {icon.name}
          </div>
        </div>
      ))}

      {/* Drag Selection Rectangle */}
      {dragSelection && (
        <div
          className="selection-rectangle"
          style={{
            left: Math.min(dragSelection.start.x, dragSelection.current.x),
            top: Math.min(dragSelection.start.y, dragSelection.current.y),
            width: Math.abs(dragSelection.current.x - dragSelection.start.x),
            height: Math.abs(dragSelection.current.y - dragSelection.start.y)
          }}
        />
      )}

      {/* Desktop Styles */}
      <style jsx>{`
        .desktop {
          width: 100%;
          height: 100%;
          position: relative;
          user-select: none;
          cursor: default;
        }

        .desktop-icon {
          position: absolute;
          width: 64px;
          height: 80px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border-radius: 8px;
          padding: 4px;
          transition: background-color 0.2s ease;
        }

        .desktop-icon:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }

        .desktop-icon.selected {
          background-color: rgba(0, 122, 255, 0.3);
        }

        .icon-image {
          font-size: 32px;
          margin-bottom: 4px;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
        }

        .icon-name {
          font-size: 11px;
          color: white;
          text-align: center;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
          word-wrap: break-word;
          line-height: 1.2;
          max-width: 60px;
        }

        .selection-rectangle {
          position: absolute;
          border: 1px solid rgba(255, 255, 255, 0.5);
          background-color: rgba(255, 255, 255, 0.1);
          pointer-events: none;
          z-index: 1000;
        }

        /* Dark theme adjustments */
        .desktop.dark .icon-name {
          color: #f2f2f7;
        }

        /* Right-click context menu positioning */
        .desktop {
          --context-menu-x: 0px;
          --context-menu-y: 0px;
        }
      `}</style>
    </div>
  )
}

export default Desktop
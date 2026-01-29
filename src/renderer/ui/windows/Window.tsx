import React, { useRef, useState, useCallback, useEffect } from 'react'
import { WindowState, useApp } from '../../contexts/AppContext'
import { useTheme } from '../../contexts/ThemeContext'

interface WindowProps {
  window: WindowState
  onAction: (windowId: string, action: string, data?: any) => void
}

const Window: React.FC<WindowProps> = ({ window, onAction }) => {
  const { getAppInfo } = useApp()
  const { currentTheme, shouldReduceMotion } = useTheme()
  const windowRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })

  const appInfo = getAppInfo(window.appId)

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    event.preventDefault()
    onAction(window.id, 'focus')
  }, [window.id, onAction])

  const handleTitleBarMouseDown = useCallback((event: React.MouseEvent) => {
    if (event.detail === 2) {
      // Double click - maximize/restore
      onAction(window.id, 'maximize')
      return
    }

    if (!window.isMovable) return

    event.preventDefault()
    setIsDragging(true)
    setDragStart({
      x: event.clientX - window.position.x,
      y: event.clientY - window.position.y
    })
  }, [window, onAction])

  const handleResizeMouseDown = useCallback((event: React.MouseEvent) => {
    if (!window.isResizable) return

    event.preventDefault()
    event.stopPropagation()
    setIsResizing(true)
    setResizeStart({
      x: event.clientX,
      y: event.clientY,
      width: window.size.width,
      height: window.size.height
    })
  }, [window])

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (isDragging) {
      const newPosition = {
        x: Math.max(0, Math.min(window.innerWidth - window.size.width, event.clientX - dragStart.x)),
        y: Math.max(0, Math.min(window.innerHeight - window.size.height, event.clientY - dragStart.y))
      }
      onAction(window.id, 'move', newPosition)
    }

    if (isResizing) {
      const deltaX = event.clientX - resizeStart.x
      const deltaY = event.clientY - resizeStart.y
      
      const newSize = {
        width: Math.max(200, resizeStart.width + deltaX),
        height: Math.max(150, resizeStart.height + deltaY)
      }
      onAction(window.id, 'resize', newSize)
    }
  }, [isDragging, isResizing, dragStart, resizeStart, window, onAction])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setIsResizing(false)
  }, [])

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp])

  if (window.isMinimized) {
    return null
  }

  const windowStyle: React.CSSProperties = {
    position: 'absolute',
    left: window.position.x,
    top: window.position.y,
    width: window.size.width,
    height: window.size.height,
    zIndex: window.zIndex,
    opacity: window.opacity,
    transform: window.isMaximized 
      ? 'none'
      : shouldReduceMotion 
        ? 'none' 
        : `scale(${window.isFocused ? 1 : 0.98})`,
    transition: shouldReduceMotion ? 'none' : 'transform 0.2s ease, opacity 0.2s ease'
  }

  if (window.isMaximized) {
    windowStyle.left = 0
    windowStyle.top = 0
    windowStyle.width = '100vw'
    windowStyle.height = 'calc(100vh - 24px)'
  }

  const renderAppContent = () => {
    // This would be where actual app content is rendered
    // For now, we'll render a placeholder based on the app type
    switch (window.appId) {
      case 'moltbot':
        return (
          <div className="app-content moltbot-content">
            <div className="moltbot-header">
              <h2>🤖 MoltBot Assistant</h2>
              <p>Your AI-powered productivity companion</p>
            </div>
            <div className="moltbot-chat">
              <div className="chat-messages">
                <div className="message bot">
                  <div className="avatar">🤖</div>
                  <div className="text">Hello! I'm MoltBot. How can I help you today?</div>
                </div>
              </div>
              <div className="chat-input">
                <input type="text" placeholder="Ask me anything..." />
                <button>Send</button>
              </div>
            </div>
          </div>
        )
      case 'finder':
        return (
          <div className="app-content finder-content">
            <div className="finder-toolbar">
              <div className="toolbar-buttons">
                <button>←</button>
                <button>→</button>
              </div>
              <div className="path">Home</div>
            </div>
            <div className="finder-sidebar">
              <div className="sidebar-item">📁 Documents</div>
              <div className="sidebar-item">📁 Downloads</div>
              <div className="sidebar-item">📁 Desktop</div>
            </div>
            <div className="finder-main">
              <div className="file-item">📄 Document.txt</div>
              <div className="file-item">🖼️ Image.png</div>
              <div className="file-item">📁 Folder</div>
            </div>
          </div>
        )
      case 'terminal':
        return (
          <div className="app-content terminal-content">
            <div className="terminal-line">
              <span className="prompt">user@moltos:~$</span>
              <span className="command">welcome to MoltOS terminal</span>
            </div>
            <div className="terminal-line">
              <span className="output">MoltBot OS v1.0.0 - Lightweight macOS Experience</span>
            </div>
            <div className="terminal-line">
              <span className="prompt">user@moltos:~$</span>
              <span className="cursor">|</span>
            </div>
          </div>
        )
      default:
        return (
          <div className="app-content default-content">
            <div className="app-placeholder">
              <div className="app-icon">{appInfo?.icon || '📱'}</div>
              <h3>{appInfo?.displayName || window.title}</h3>
              <p>{appInfo?.description || 'Application content would appear here'}</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div
      ref={windowRef}
      className={`window ${window.isFocused ? 'focused' : 'unfocused'} ${currentTheme}`}
      style={windowStyle}
      onMouseDown={handleMouseDown}
    >
      {/* Title Bar */}
      <div 
        className="title-bar"
        onMouseDown={handleTitleBarMouseDown}
      >
        <div className="traffic-lights">
          <button 
            className="traffic-light close"
            onClick={(e) => {
              e.stopPropagation()
              onAction(window.id, 'close')
            }}
          />
          <button 
            className="traffic-light minimize"
            onClick={(e) => {
              e.stopPropagation()
              onAction(window.id, 'minimize')
            }}
          />
          <button 
            className="traffic-light maximize"
            onClick={(e) => {
              e.stopPropagation()
              onAction(window.id, 'maximize')
            }}
          />
        </div>
        
        <div className="title-text">
          <span className="app-icon">{appInfo?.icon}</span>
          {window.title}
        </div>
        
        <div className="title-controls">
          {/* Additional controls would go here */}
        </div>
      </div>

      {/* Window Content */}
      <div className="window-content">
        {renderAppContent()}
      </div>

      {/* Resize Handle */}
      {window.isResizable && (
        <div 
          className="resize-handle"
          onMouseDown={handleResizeMouseDown}
        />
      )}

      <style jsx>{`
        .window {
          background: var(--window-bg);
          border: 1px solid var(--window-border);
          border-radius: 12px;
          box-shadow: var(--shadow-window);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .window.unfocused {
          opacity: 0.9;
        }

        .title-bar {
          height: 44px;
          background: var(--window-bg);
          border-bottom: 1px solid var(--window-border);
          display: flex;
          align-items: center;
          padding: 0 12px;
          user-select: none;
          cursor: move;
        }

        .traffic-lights {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }

        .traffic-light {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          transition: opacity 0.2s ease;
        }

        .traffic-light:hover {
          opacity: 0.8;
        }

        .traffic-light.close {
          background: #ff5f57;
        }

        .traffic-light.minimize {
          background: #ffbd2e;
        }

        .traffic-light.maximize {
          background: #28ca42;
        }

        .title-text {
          flex: 1;
          text-align: center;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .app-icon {
          font-size: 16px;
        }

        .title-controls {
          width: 80px;
          flex-shrink: 0;
        }

        .window-content {
          flex: 1;
          overflow: auto;
          position: relative;
        }

        .resize-handle {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 16px;
          height: 16px;
          cursor: nw-resize;
          background: linear-gradient(-45deg, transparent 30%, var(--window-border) 30%, var(--window-border) 50%, transparent 50%);
        }

        /* App Content Styles */
        .app-content {
          padding: 16px;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .default-content {
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .app-placeholder .app-icon {
          font-size: 48px;
          margin-bottom: 12px;
        }

        .app-placeholder h3 {
          margin: 0 0 8px 0;
          color: var(--text-primary);
        }

        .app-placeholder p {
          margin: 0;
          color: var(--text-secondary);
          font-size: 12px;
        }

        /* MoltBot Content */
        .moltbot-content {
          gap: 16px;
        }

        .moltbot-header {
          text-align: center;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--window-border);
        }

        .moltbot-header h2 {
          margin: 0 0 4px 0;
          color: var(--text-primary);
        }

        .moltbot-header p {
          margin: 0;
          color: var(--text-secondary);
          font-size: 12px;
        }

        .moltbot-chat {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
        }

        .message {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }

        .message .avatar {
          font-size: 20px;
          flex-shrink: 0;
        }

        .message .text {
          background: var(--surface-primary);
          padding: 8px 12px;
          border-radius: 12px;
          font-size: 12px;
        }

        .chat-input {
          display: flex;
          gap: 8px;
        }

        .chat-input input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid var(--window-border);
          border-radius: 6px;
          background: var(--surface-primary);
          color: var(--text-primary);
          font-size: 12px;
        }

        .chat-input button {
          padding: 8px 16px;
          background: var(--accent-color);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
        }

        /* Finder Content */
        .finder-content {
          flex-direction: column;
          padding: 0;
        }

        .finder-toolbar {
          padding: 8px 12px;
          border-bottom: 1px solid var(--window-border);
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .toolbar-buttons {
          display: flex;
          gap: 4px;
        }

        .toolbar-buttons button {
          width: 24px;
          height: 24px;
          border: 1px solid var(--window-border);
          border-radius: 4px;
          background: var(--surface-primary);
          cursor: pointer;
          font-size: 12px;
        }

        .path {
          font-size: 12px;
          color: var(--text-primary);
        }

        .finder-sidebar {
          width: 150px;
          background: var(--surface-secondary);
          border-right: 1px solid var(--window-border);
          padding: 8px;
        }

        .sidebar-item {
          padding: 4px 8px;
          font-size: 12px;
          border-radius: 4px;
          cursor: pointer;
        }

        .sidebar-item:hover {
          background: var(--surface-primary);
        }

        .finder-main {
          flex: 1;
          padding: 16px;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
          gap: 12px;
          overflow-y: auto;
        }

        .file-item {
          text-align: center;
          padding: 8px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
        }

        .file-item:hover {
          background: var(--surface-primary);
        }

        /* Terminal Content */
        .terminal-content {
          background: #1e1e1e;
          color: #00ff00;
          font-family: 'SF Mono', Monaco, monospace;
          font-size: 12px;
          line-height: 1.4;
          padding: 12px;
        }

        .terminal-line {
          display: flex;
          gap: 8px;
          margin-bottom: 4px;
        }

        .prompt {
          color: #00aaff;
        }

        .command {
          color: #ffffff;
        }

        .output {
          color: #00ff00;
        }

        .cursor {
          animation: blink 1s infinite;
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }

        /* Dark theme adjustments */
        .window.dark {
          border-color: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  )
}

export default Window
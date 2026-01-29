import React, { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Desktop from './components/Desktop'
import MenuBar from './ui/menubar/MenuBar'
import Dock from './ui/dock/Dock'
import WindowManager from './ui/windows/WindowManager'
import SpotlightSearch from './ui/components/SpotlightSearch'
import NotificationCenter from './ui/components/NotificationCenter'
import ContextMenu from './ui/components/ContextMenu'
import { useDesktop } from './contexts/DesktopContext'
import { useTheme } from './contexts/ThemeContext'
import { useApp } from './contexts/AppContext'

const App: React.FC = () => {
  const { isSpotlightOpen, showNotifications } = useDesktop()
  const { theme } = useTheme()
  const { activeApps } = useApp()

  return (
    <div className={`moltos-app ${theme}`} data-theme={theme}>
      {/* Menu Bar - Always visible at top */}
      <MenuBar />
      
      {/* Main Desktop Area */}
      <main className="desktop-container">
        <Routes>
          <Route path="/" element={<Desktop />} />
          <Route path="/apps/:appId" element={<Desktop />} />
          <Route path="/settings/*" element={<Desktop />} />
        </Routes>
      </main>
      
      {/* Window Manager - Handles all app windows */}
      <WindowManager apps={activeApps} />
      
      {/* Dock - Always visible at bottom */}
      <Dock />
      
      {/* Overlay Components */}
      {isSpotlightOpen && <SpotlightSearch />}
      {showNotifications && <NotificationCenter />}
      
      {/* Global Context Menu */}
      <ContextMenu />
      
      {/* Global Styles */}
      <style jsx global>{`
        .moltos-app {
          width: 100vw;
          height: 100vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: var(--desktop-bg);
          color: var(--text-primary);
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif;
          font-size: 13px;
          line-height: 1.4;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        .desktop-container {
          flex: 1;
          position: relative;
          overflow: hidden;
        }
        
        /* CSS Variables for theming */
        .moltos-app[data-theme="light"] {
          --desktop-bg: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          --menubar-bg: rgba(255, 255, 255, 0.8);
          --dock-bg: rgba(255, 255, 255, 0.7);
          --window-bg: #ffffff;
          --window-border: rgba(0, 0, 0, 0.1);
          --text-primary: #1d1d1f;
          --text-secondary: #86868b;
          --accent-color: #007aff;
          --surface-primary: #f2f2f7;
          --surface-secondary: #ffffff;
          --shadow-window: 0 4px 20px rgba(0, 0, 0, 0.15);
          --shadow-menu: 0 4px 16px rgba(0, 0, 0, 0.2);
        }
        
        .moltos-app[data-theme="dark"] {
          --desktop-bg: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
          --menubar-bg: rgba(28, 28, 30, 0.8);
          --dock-bg: rgba(28, 28, 30, 0.7);
          --window-bg: #1c1c1e;
          --window-border: rgba(255, 255, 255, 0.1);
          --text-primary: #f2f2f7;
          --text-secondary: #8e8e93;
          --accent-color: #0a84ff;
          --surface-primary: #2c2c2e;
          --surface-secondary: #1c1c1e;
          --shadow-window: 0 4px 20px rgba(0, 0, 0, 0.3);
          --shadow-menu: 0 4px 16px rgba(0, 0, 0, 0.4);
        }
        
        /* Backdrop blur effects */
        .backdrop-blur {
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        
        .backdrop-blur-sm {
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
        
        /* Smooth transitions */
        * {
          transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
        }
        
        /* Custom scrollbars */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }
        
        [data-theme="dark"] ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
        }
        
        [data-theme="dark"] ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        
        /* Selection styles */
        ::selection {
          background: var(--accent-color);
          color: white;
        }
        
        /* Focus styles */
        *:focus {
          outline: 2px solid var(--accent-color);
          outline-offset: 2px;
        }
        
        button:focus,
        input:focus,
        textarea:focus,
        select:focus {
          outline: 2px solid var(--accent-color);
          outline-offset: -2px;
        }
        
        /* Animation utilities */
        .animate-scale-in {
          animation: scaleIn 0.2s ease-out;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
        
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default App
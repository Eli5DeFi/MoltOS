import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { DesktopProvider } from './contexts/DesktopContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { AppProvider } from './contexts/AppContext'
import './styles/globals.css'

// Performance optimization: Preload critical resources
const preloadResources = () => {
  // Preload critical fonts
  const fontPreloads = [
    'SF Pro Display',
    'SF Pro Text',
    'SF Mono'
  ]
  
  fontPreloads.forEach(font => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'font'
    link.href = `/fonts/${font.replace(/\s+/g, '-').toLowerCase()}.woff2`
    link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
  })
}

// Initialize MoltBot
const initializeMoltBot = async () => {
  try {
    // Preload resources
    preloadResources()
    
    // Initialize system services
    if (window.moltOS) {
      const systemInfo = await window.moltOS.system.getInfo()
      console.log('🤖 MoltBot OS initialized on:', systemInfo.platform)
      
      // Set theme based on system preference
      const theme = await window.moltOS.theme.get()
      document.documentElement.className = theme === 'dark' ? 'dark' : 'light'
    }
    
    // Remove boot screen after initialization
    setTimeout(() => {
      const bootScreen = document.querySelector('.boot-screen')
      if (bootScreen) {
        bootScreen.style.opacity = '0'
        bootScreen.style.transition = 'opacity 0.5s ease-out'
        setTimeout(() => bootScreen.remove(), 500)
      }
    }, 1500)
    
  } catch (error) {
    console.error('Failed to initialize MoltBot OS:', error)
  }
}

// Render the application
const root = ReactDOM.createRoot(document.getElementById('root')!)

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <DesktopProvider>
          <AppProvider>
            <App />
          </AppProvider>
        </DesktopProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)

// Initialize on load
initializeMoltBot()

// Global error boundary
window.addEventListener('error', (event) => {
  console.error('🚨 MoltBot Error:', event.error)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 MoltBot Promise Rejection:', event.reason)
})

// Performance monitoring
if (process.env.NODE_ENV === 'development') {
  // Enable React DevTools
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__?.onCommitFiberRoot?.()
}
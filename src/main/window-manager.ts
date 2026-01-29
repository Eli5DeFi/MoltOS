import { BrowserWindow, screen } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

export interface WindowConfig {
  width?: number
  height?: number
  minWidth?: number
  minHeight?: number
  x?: number
  y?: number
  resizable?: boolean
  frame?: boolean
  titleBarStyle?: 'default' | 'hidden' | 'hiddenInset' | 'customButtonsOnHover'
  transparent?: boolean
  alwaysOnTop?: boolean
  skipTaskbar?: boolean
  vibrancy?: 'appearance-based' | 'light' | 'dark' | 'titlebar' | 'selection' | 'menu' | 'popover' | 'sidebar' | 'medium-light' | 'ultra-dark' | 'header' | 'sheet' | 'window' | 'hud' | 'fullscreen-ui' | 'tooltip' | 'content' | 'under-window' | 'under-page'
}

export class WindowManager {
  private windows: Map<string, BrowserWindow> = new Map()
  private windowConfigs: Map<string, WindowConfig> = new Map()

  constructor() {
    this.setupDefaultConfigs()
  }

  private setupDefaultConfigs() {
    // Main desktop window
    this.windowConfigs.set('main', {
      width: 1200,
      height: 800,
      minWidth: 1024,
      minHeight: 768,
      titleBarStyle: 'hiddenInset',
      vibrancy: 'under-window'
    })

    // Finder window
    this.windowConfigs.set('finder', {
      width: 900,
      height: 600,
      minWidth: 600,
      minHeight: 400,
      titleBarStyle: 'hiddenInset',
      vibrancy: 'sidebar'
    })

    // Terminal window
    this.windowConfigs.set('terminal', {
      width: 800,
      height: 500,
      minWidth: 400,
      minHeight: 300,
      titleBarStyle: 'hiddenInset',
      vibrancy: 'dark'
    })

    // Calculator window
    this.windowConfigs.set('calculator', {
      width: 240,
      height: 320,
      minWidth: 240,
      minHeight: 320,
      resizable: false,
      titleBarStyle: 'hiddenInset',
      vibrancy: 'light'
    })

    // Settings window
    this.windowConfigs.set('settings', {
      width: 800,
      height: 600,
      minWidth: 700,
      minHeight: 500,
      titleBarStyle: 'hiddenInset',
      vibrancy: 'under-window'
    })

    // Spotlight search
    this.windowConfigs.set('spotlight', {
      width: 640,
      height: 480,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: false,
      vibrancy: 'popover'
    })

    // Dock
    this.windowConfigs.set('dock', {
      width: 600,
      height: 80,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: false,
      vibrancy: 'menu'
    })

    // Menu bar
    this.windowConfigs.set('menubar', {
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: false,
      vibrancy: 'titlebar'
    })
  }

  async createWindow(
    windowId: string, 
    config?: WindowConfig,
    rendererPath?: string
  ): Promise<BrowserWindow> {
    // Check if window already exists
    if (this.windows.has(windowId)) {
      const existingWindow = this.windows.get(windowId)!
      existingWindow.focus()
      return existingWindow
    }

    // Merge default config with provided config
    const defaultConfig = this.windowConfigs.get(windowId) || {}
    const finalConfig = { ...defaultConfig, ...config }

    // Calculate window position (center on screen by default)
    const primaryDisplay = screen.getPrimaryDisplay()
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize

    if (!finalConfig.x) {
      finalConfig.x = Math.floor((screenWidth - (finalConfig.width || 800)) / 2)
    }
    if (!finalConfig.y) {
      finalConfig.y = Math.floor((screenHeight - (finalConfig.height || 600)) / 2)
    }

    const window = new BrowserWindow({
      width: finalConfig.width,
      height: finalConfig.height,
      minWidth: finalConfig.minWidth,
      minHeight: finalConfig.minHeight,
      x: finalConfig.x,
      y: finalConfig.y,
      resizable: finalConfig.resizable !== false,
      frame: finalConfig.frame !== false,
      titleBarStyle: finalConfig.titleBarStyle || 'hiddenInset',
      transparent: finalConfig.transparent || false,
      alwaysOnTop: finalConfig.alwaysOnTop || false,
      skipTaskbar: finalConfig.skipTaskbar || false,
      vibrancy: finalConfig.vibrancy,
      visualEffectState: 'active',
      webPreferences: {
        preload: join(__dirname, '../preload/preload.js'),
        contextIsolation: true,
        enableRemoteModule: false,
        nodeIntegration: false,
        sandbox: false,
        webSecurity: true,
        additionalArguments: [`--window-id=${windowId}`]
      },
      show: false,
      backgroundColor: finalConfig.transparent ? '#00000000' : '#FFFFFF'
    })

    // Load the appropriate renderer
    const path = rendererPath || `../renderer/${windowId}.html`
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      window.loadURL(`${process.env['ELECTRON_RENDERER_URL']}#${windowId}`)
    } else {
      try {
        window.loadFile(join(__dirname, path))
      } catch {
        // Fallback to main renderer with window ID
        window.loadFile(join(__dirname, '../renderer/index.html'))
        window.webContents.executeJavaScript(`
          window.MOLTOS_WINDOW_ID = '${windowId}';
          window.dispatchEvent(new CustomEvent('moltos:window-ready', { detail: '${windowId}' }));
        `)
      }
    }

    // Show window when ready
    window.once('ready-to-show', () => {
      window.show()
      
      // Apply window-specific styling
      this.applyWindowStyling(window, windowId)
    })

    // Handle window closed
    window.on('closed', () => {
      this.windows.delete(windowId)
    })

    // Store window reference
    this.windows.set(windowId, window)

    return window
  }

  private applyWindowStyling(window: BrowserWindow, windowId: string) {
    // Apply macOS-specific styling based on window type
    switch (windowId) {
      case 'dock':
        // Position dock at bottom of screen
        const primaryDisplay = screen.getPrimaryDisplay()
        const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize
        window.setPosition(
          Math.floor((screenWidth - 600) / 2),
          screenHeight - 80
        )
        break
      
      case 'menubar':
        // Position menu bar at top of screen
        window.setPosition(0, 0)
        window.setSize(screen.getPrimaryDisplay().workAreaSize.width, 24)
        break
      
      case 'spotlight':
        // Center spotlight search
        const display = screen.getPrimaryDisplay()
        const { width, height } = display.workAreaSize
        window.setPosition(
          Math.floor((width - 640) / 2),
          Math.floor(height * 0.2)
        )
        break
    }
  }

  getWindow(windowId: string): BrowserWindow | undefined {
    return this.windows.get(windowId)
  }

  getAllWindows(): Map<string, BrowserWindow> {
    return this.windows
  }

  closeWindow(windowId: string): boolean {
    const window = this.windows.get(windowId)
    if (window) {
      window.close()
      return true
    }
    return false
  }

  focusWindow(windowId: string): boolean {
    const window = this.windows.get(windowId)
    if (window) {
      window.focus()
      return true
    }
    return false
  }

  minimizeWindow(windowId: string): boolean {
    const window = this.windows.get(windowId)
    if (window) {
      window.minimize()
      return true
    }
    return false
  }

  maximizeWindow(windowId: string): boolean {
    const window = this.windows.get(windowId)
    if (window) {
      if (window.isMaximized()) {
        window.unmaximize()
      } else {
        window.maximize()
      }
      return true
    }
    return false
  }

  registerWindow(windowId: string, window: BrowserWindow) {
    this.windows.set(windowId, window)
  }

  unregisterWindow(windowId: string) {
    this.windows.delete(windowId)
  }

  // Utility methods for window management
  cascadeWindows() {
    const windows = Array.from(this.windows.values())
    windows.forEach((window, index) => {
      const offset = index * 30
      const bounds = window.getBounds()
      window.setPosition(bounds.x + offset, bounds.y + offset)
    })
  }

  tileWindows() {
    const windows = Array.from(this.windows.values()).filter(w => w.isVisible())
    if (windows.length === 0) return

    const primaryDisplay = screen.getPrimaryDisplay()
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize

    const cols = Math.ceil(Math.sqrt(windows.length))
    const rows = Math.ceil(windows.length / cols)
    const windowWidth = Math.floor(screenWidth / cols)
    const windowHeight = Math.floor(screenHeight / rows)

    windows.forEach((window, index) => {
      const row = Math.floor(index / cols)
      const col = index % cols
      window.setBounds({
        x: col * windowWidth,
        y: row * windowHeight,
        width: windowWidth,
        height: windowHeight
      })
    })
  }
}

export default WindowManager
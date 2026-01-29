import { app, BrowserWindow, Menu, ipcMain, shell } from 'electron'
import { join } from 'path'

// Keep a global reference of the window object
let mainWindow: BrowserWindow | null = null

// Enable live reload for development
if (process.env.NODE_ENV === 'development') {
  try {
    require('electron-reload')(__dirname, {
      electron: join(__dirname, '..', '..', 'node_modules', '.bin', 'electron'),
      hardResetMethod: 'exit'
    })
  } catch (error) {
    console.log('electron-reload not available in production')
  }
}

const isDevelopment = process.env.NODE_ENV === 'development'

function createWindow(): void {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    titleBarOverlay: false,
    frame: false,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: join(__dirname, '../preload/preload.js'),
      webSecurity: true
    }
  })

  // Set the app menu
  const template: any[] = [
    {
      label: 'MoltOS',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services', submenu: [] },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'File',
      submenu: [
        { role: 'close' },
        { type: 'separator' },
        { role: 'minimize' },
        { role: 'zoom' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectall' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  // Load the app
  if (isDevelopment) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    if (!mainWindow) return
    mainWindow.show()
    
    if (isDevelopment) {
      mainWindow.webContents.openDevTools()
    }
  })

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

// App event handlers
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IPC handlers for communication with renderer
ipcMain.handle('app:getVersion', () => {
  return app.getVersion()
})

ipcMain.handle('app:getName', () => {
  return app.getName()
})

ipcMain.handle('window:minimize', () => {
  mainWindow?.minimize()
})

ipcMain.handle('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow?.maximize()
  }
})

ipcMain.handle('window:close', () => {
  mainWindow?.close()
})

// File system operations (basic example)
ipcMain.handle('fs:readDir', async (event, path: string) => {
  try {
    const fs = require('fs').promises
    const entries = await fs.readdir(path, { withFileTypes: true })
    return entries.map((entry: any) => ({
      name: entry.name,
      isDirectory: entry.isDirectory(),
      isFile: entry.isFile()
    }))
  } catch (error) {
    console.error('Error reading directory:', error)
    return []
  }
})

export {}
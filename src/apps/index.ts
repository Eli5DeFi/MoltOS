// Enhanced App Registry for MoltOS
// Lightweight, modular app system with premium features

export interface AppModule {
  id: string
  name: string
  displayName: string
  icon: string
  category: 'productivity' | 'developer' | 'communication' | 'system' | 'utility' | 'entertainment'
  version: string
  description: string
  component: React.ComponentType<any>
  isBuiltIn: boolean
  permissions: string[]
  shortcuts?: { [key: string]: string }
  windowOptions?: {
    defaultWidth: number
    defaultHeight: number
    minWidth: number
    minHeight: number
    resizable: boolean
    maximizable: boolean
  }
}

// Lazy-loaded app components for performance
const apps: AppModule[] = [
  {
    id: 'finder',
    name: 'Finder',
    displayName: 'Finder',
    icon: '🗂️',
    category: 'system',
    version: '2.0.0',
    description: 'Advanced file manager with cloud sync',
    component: React.lazy(() => import('./finder/FinderApp')),
    isBuiltIn: true,
    permissions: ['filesystem.read', 'filesystem.write', 'cloud.sync'],
    shortcuts: { 'cmd+shift+f': 'search', 'cmd+up': 'parent' },
    windowOptions: {
      defaultWidth: 1000,
      defaultHeight: 700,
      minWidth: 600,
      minHeight: 400,
      resizable: true,
      maximizable: true
    }
  },
  {
    id: 'terminal',
    name: 'Terminal',
    displayName: 'Terminal Pro',
    icon: '⚫',
    category: 'developer',
    version: '2.0.0',
    description: 'Advanced terminal with SSH, themes, and AI assistance',
    component: React.lazy(() => import('./terminal/TerminalApp')),
    isBuiltIn: true,
    permissions: ['system.exec', 'network.request'],
    shortcuts: { 'cmd+t': 'new_tab', 'cmd+w': 'close_tab' },
    windowOptions: {
      defaultWidth: 900,
      defaultHeight: 600,
      minWidth: 500,
      minHeight: 300,
      resizable: true,
      maximizable: true
    }
  },
  {
    id: 'notes',
    name: 'Notes',
    displayName: 'Notes Pro',
    icon: '📝',
    category: 'productivity',
    version: '2.0.0',
    description: 'Rich text editor with markdown, collaboration, and AI writing',
    component: React.lazy(() => import('./notes/NotesApp')),
    isBuiltIn: true,
    permissions: ['filesystem.read', 'filesystem.write', 'cloud.sync'],
    shortcuts: { 'cmd+n': 'new_note', 'cmd+s': 'save' },
    windowOptions: {
      defaultWidth: 800,
      defaultHeight: 600,
      minWidth: 400,
      minHeight: 300,
      resizable: true,
      maximizable: true
    }
  },
  {
    id: 'calculator',
    name: 'Calculator',
    displayName: 'Calculator Pro',
    icon: '🔢',
    category: 'utility',
    version: '2.0.0',
    description: 'Scientific calculator with unit conversion and history',
    component: React.lazy(() => import('./calculator/CalculatorApp')),
    isBuiltIn: true,
    permissions: [],
    windowOptions: {
      defaultWidth: 320,
      defaultHeight: 480,
      minWidth: 280,
      minHeight: 400,
      resizable: false,
      maximizable: false
    }
  },
  {
    id: 'code-editor',
    name: 'Code Editor',
    displayName: 'MoltCode',
    icon: '💻',
    category: 'developer',
    version: '2.0.0',
    description: 'Lightweight code editor with IntelliSense and Git integration',
    component: React.lazy(() => import('./code-editor/CodeEditorApp')),
    isBuiltIn: true,
    permissions: ['filesystem.read', 'filesystem.write', 'system.exec'],
    shortcuts: { 'cmd+p': 'quick_open', 'cmd+shift+p': 'command_palette' },
    windowOptions: {
      defaultWidth: 1200,
      defaultHeight: 800,
      minWidth: 800,
      minHeight: 600,
      resizable: true,
      maximizable: true
    }
  },
  {
    id: 'music-player',
    name: 'Music',
    displayName: 'MoltMusic',
    icon: '🎵',
    category: 'entertainment',
    version: '2.0.0',
    description: 'Premium music player with streaming and local library',
    component: React.lazy(() => import('./music/MusicApp')),
    isBuiltIn: true,
    permissions: ['filesystem.read', 'network.request', 'audio.playback'],
    shortcuts: { 'space': 'play_pause', 'cmd+right': 'next_track' },
    windowOptions: {
      defaultWidth: 900,
      defaultHeight: 700,
      minWidth: 600,
      minHeight: 500,
      resizable: true,
      maximizable: true
    }
  },
  {
    id: 'system-monitor',
    name: 'Activity Monitor',
    displayName: 'System Monitor',
    icon: '📊',
    category: 'system',
    version: '2.0.0',
    description: 'Real-time system monitoring and process management',
    component: React.lazy(() => import('./system-monitor/SystemMonitorApp')),
    isBuiltIn: true,
    permissions: ['system.monitor', 'system.processes'],
    windowOptions: {
      defaultWidth: 800,
      defaultHeight: 600,
      minWidth: 600,
      minHeight: 400,
      resizable: true,
      maximizable: true
    }
  },
  {
    id: 'settings',
    name: 'System Preferences',
    displayName: 'System Preferences',
    icon: '⚙️',
    category: 'system',
    version: '2.0.0',
    description: 'Complete system configuration with themes and customization',
    component: React.lazy(() => import('./settings/SettingsApp')),
    isBuiltIn: true,
    permissions: ['system.config'],
    windowOptions: {
      defaultWidth: 900,
      defaultHeight: 650,
      minWidth: 700,
      minHeight: 500,
      resizable: true,
      maximizable: true
    }
  }
]

export const getApp = (appId: string): AppModule | undefined => {
  return apps.find(app => app.id === appId)
}

export const getAllApps = (): AppModule[] => apps

export const getAppsByCategory = (category: AppModule['category']): AppModule[] => {
  return apps.filter(app => app.category === category)
}

export const searchApps = (query: string): AppModule[] => {
  const lowerQuery = query.toLowerCase()
  return apps.filter(app => 
    app.name.toLowerCase().includes(lowerQuery) ||
    app.displayName.toLowerCase().includes(lowerQuery) ||
    app.description.toLowerCase().includes(lowerQuery)
  )
}
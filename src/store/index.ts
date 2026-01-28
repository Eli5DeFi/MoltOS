import { create } from 'zustand';
import type { WindowState, AppId, Message, SystemStatus, SettingsMode, Skill, AppStoreItem, FileItem, CalendarEvent, Email, Agent, MoltBotStatus, MoltBotInstallStatus } from '@/types';

interface DesktopStore {
  // Windows
  windows: WindowState[];
  activeWindowId: string | null;
  maxZIndex: number;

  // System
  systemStatus: SystemStatus;
  currentTime: Date;
  settingsMode: SettingsMode;

  // MoltBot
  moltbotStatus: MoltBotStatus;
  showSetupWizard: boolean;
  hasCompletedSetup: boolean;

  // App Data
  messages: Message[];
  skills: Skill[];
  appStoreItems: AppStoreItem[];
  files: FileItem[];
  calendarEvents: CalendarEvent[];
  emails: Email[];
  agents: Agent[];

  // Terminal
  terminalHistory: string[];
  terminalOutput: string[];

  // Actions
  openWindow: (appId: AppId) => void;
  closeWindow: (windowId: string) => void;
  minimizeWindow: (windowId: string) => void;
  maximizeWindow: (windowId: string) => void;
  focusWindow: (windowId: string) => void;
  updateWindowPosition: (windowId: string, x: number, y: number) => void;
  updateWindowSize: (windowId: string, width: number, height: number) => void;

  // System Actions
  updateSystemStatus: (status: Partial<SystemStatus>) => void;
  updateTime: () => void;
  setSettingsMode: (mode: SettingsMode) => void;

  // Chat Actions
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;

  // Skills Actions
  toggleSkillInstall: (skillId: string) => void;

  // App Store Actions
  toggleAppInstall: (appId: string) => void;

  // Terminal Actions
  executeCommand: (command: string) => void;
  clearTerminal: () => void;

  // Calendar Actions
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  removeCalendarEvent: (eventId: string) => void;

  // Email Actions
  toggleEmailRead: (emailId: string) => void;
  toggleEmailStar: (emailId: string) => void;

  // Agent Actions
  toggleAgentStatus: (agentId: string) => void;

  // MoltBot Actions
  setMoltbotStatus: (status: MoltBotStatus) => void;
  updateMoltbotInstallStatus: (status: MoltBotInstallStatus) => void;
  setShowSetupWizard: (show: boolean) => void;
  completeSetup: () => void;
}

const defaultSystemStatus: SystemStatus = {
  cpu: 23,
  memory: 45,
  disk: 67,
  network: { upload: 1.2, download: 5.8 },
  clawdbotStatus: 'connected',
  battery: 87,
  wifi: 'connected',
};

const defaultMoltbotStatus: MoltBotStatus = {
  installStatus: 'checking',
  isGatewayRunning: false,
};

const defaultSkills: Skill[] = [
  { id: '1', name: 'Code Analysis', description: 'Analyze and understand code structure', usage: 'analyze <file_path>', icon: '🔍', category: 'Development', installed: true },
  { id: '2', name: 'Git Operations', description: 'Execute git commands safely', usage: 'git <command>', icon: '📦', category: 'Development', installed: true },
  { id: '3', name: 'File Manager', description: 'Browse and manage files', usage: 'files <action> <path>', icon: '📁', category: 'System', installed: true },
  { id: '4', name: 'Web Search', description: 'Search the internet for information', usage: 'search <query>', icon: '🌐', category: 'Research', installed: true },
  { id: '5', name: 'Image Generation', description: 'Generate images from text prompts', usage: 'imagine <prompt>', icon: '🎨', category: 'Creative', installed: false },
  { id: '6', name: 'Data Visualization', description: 'Create charts and graphs', usage: 'visualize <data>', icon: '📊', category: 'Analytics', installed: false },
  { id: '7', name: 'API Tester', description: 'Test REST API endpoints', usage: 'api <method> <url>', icon: '🔌', category: 'Development', installed: true },
  { id: '8', name: 'Database Query', description: 'Query databases safely', usage: 'query <sql>', icon: '🗃️', category: 'Data', installed: false },
];

const defaultAppStoreItems: AppStoreItem[] = [
  { id: '1', name: 'Code Companion', description: 'AI-powered coding assistant with real-time suggestions', icon: '💻', category: 'Development', rating: 4.8, downloads: '10K+', installed: true, developer: 'Clawdhub' },
  { id: '2', name: 'Smart Summarizer', description: 'Instantly summarize documents and articles', icon: '📝', category: 'Productivity', rating: 4.6, downloads: '5K+', installed: false, developer: 'Clawdhub' },
  { id: '3', name: 'Voice Assistant', description: 'Natural language voice commands', icon: '🎤', category: 'Utilities', rating: 4.4, downloads: '8K+', installed: false, developer: 'Clawdhub' },
  { id: '4', name: 'Task Automator', description: 'Automate repetitive tasks with ease', icon: '⚡', category: 'Productivity', rating: 4.7, downloads: '12K+', installed: true, developer: 'Clawdhub' },
  { id: '5', name: 'Memory Manager', description: 'Enhanced context and memory management', icon: '🧠', category: 'System', rating: 4.9, downloads: '15K+', installed: true, developer: 'Clawdhub' },
  { id: '6', name: 'Debug Helper', description: 'Intelligent debugging and error analysis', icon: '🐛', category: 'Development', rating: 4.5, downloads: '7K+', installed: false, developer: 'Clawdhub' },
  { id: '7', name: 'Doc Generator', description: 'Auto-generate documentation from code', icon: '📚', category: 'Development', rating: 4.3, downloads: '3K+', installed: false, developer: 'Clawdhub' },
  { id: '8', name: 'Security Scanner', description: 'Scan code for security vulnerabilities', icon: '🔒', category: 'Security', rating: 4.8, downloads: '9K+', installed: true, developer: 'Clawdhub' },
];

const defaultFiles: FileItem[] = [
  { id: '1', name: 'Documents', type: 'folder', modified: new Date(), path: '/Documents' },
  { id: '2', name: 'Projects', type: 'folder', modified: new Date(), path: '/Projects' },
  { id: '3', name: 'Downloads', type: 'folder', modified: new Date(), path: '/Downloads' },
  { id: '4', name: 'readme.md', type: 'file', size: 2048, modified: new Date(), path: '/readme.md' },
  { id: '5', name: 'config.json', type: 'file', size: 512, modified: new Date(), path: '/config.json' },
  { id: '6', name: 'notes.txt', type: 'file', size: 1024, modified: new Date(), path: '/notes.txt' },
];

const defaultCalendarEvents: CalendarEvent[] = [
  { id: '1', title: 'Team Standup', date: new Date(), time: '09:00', color: '#0a84ff' },
  { id: '2', title: 'Project Review', date: new Date(), time: '14:00', color: '#30d158' },
  { id: '3', title: 'Deploy v2.0', date: new Date(Date.now() + 86400000), time: '10:00', color: '#ff9f0a' },
];

const defaultEmails: Email[] = [
  { id: '1', from: 'team@clawdhub.io', to: 'user@moltos.local', subject: 'Welcome to MoltOS!', body: 'Welcome to the MoltOS ecosystem. Get started by exploring the apps in your dock.', date: new Date(), read: false, starred: true },
  { id: '2', from: 'updates@clawdhub.io', to: 'user@moltos.local', subject: 'New Skills Available', body: 'Check out the latest skills added to Clawdhub marketplace.', date: new Date(Date.now() - 86400000), read: true, starred: false },
  { id: '3', from: 'security@moltos.local', to: 'user@moltos.local', subject: 'Security Report', body: 'Your weekly security scan completed with no issues found.', date: new Date(Date.now() - 172800000), read: true, starred: false },
];

const defaultAgents: Agent[] = [
  { id: '1', name: 'Clawdbot Prime', status: 'active', type: 'General Assistant', description: 'Main AI assistant for general tasks', lastActive: new Date() },
  { id: '2', name: 'Code Agent', status: 'idle', type: 'Development', description: 'Specialized in code analysis and generation', lastActive: new Date(Date.now() - 300000) },
  { id: '3', name: 'Research Agent', status: 'active', type: 'Research', description: 'Web research and information gathering', lastActive: new Date() },
  { id: '4', name: 'Security Agent', status: 'offline', type: 'Security', description: 'Security scanning and vulnerability detection', lastActive: new Date(Date.now() - 3600000) },
];

const appDefaults: Record<AppId, { title: string; width: number; height: number }> = {
  chat: { title: 'Chat', width: 500, height: 600 },
  apps: { title: 'App Store', width: 800, height: 600 },
  skills: { title: 'Skills', width: 700, height: 550 },
  monitor: { title: 'Monitor', width: 650, height: 500 },
  terminal: { title: 'Terminal', width: 700, height: 450 },
  files: { title: 'Files', width: 750, height: 500 },
  calendar: { title: 'Calendar', width: 600, height: 550 },
  mail: { title: 'Mail', width: 800, height: 550 },
  agents: { title: 'Agents', width: 700, height: 500 },
  settings: { title: 'Settings', width: 650, height: 500 },
};

// Check if user has completed setup before
const hasCompletedSetupBefore = localStorage.getItem('moltos_setup_complete') === 'true';

export const useDesktopStore = create<DesktopStore>((set, get) => ({
  windows: [],
  activeWindowId: null,
  maxZIndex: 0,
  systemStatus: defaultSystemStatus,
  currentTime: new Date(),
  settingsMode: 'simple',
  moltbotStatus: defaultMoltbotStatus,
  showSetupWizard: !hasCompletedSetupBefore,
  hasCompletedSetup: hasCompletedSetupBefore,
  messages: [],
  skills: defaultSkills,
  appStoreItems: defaultAppStoreItems,
  files: defaultFiles,
  calendarEvents: defaultCalendarEvents,
  emails: defaultEmails,
  agents: defaultAgents,
  terminalHistory: [],
  terminalOutput: ['Welcome to MoltOS Terminal v1.0', 'Type "help" for available commands.', ''],

  openWindow: (appId: AppId) => {
    const existing = get().windows.find(w => w.appId === appId && !w.isMinimized);
    if (existing) {
      get().focusWindow(existing.id);
      return;
    }

    const minimized = get().windows.find(w => w.appId === appId && w.isMinimized);
    if (minimized) {
      set(state => ({
        windows: state.windows.map(w =>
          w.id === minimized.id ? { ...w, isMinimized: false, zIndex: state.maxZIndex + 1 } : w
        ),
        activeWindowId: minimized.id,
        maxZIndex: state.maxZIndex + 1,
      }));
      return;
    }

    const defaults = appDefaults[appId];
    const newWindow: WindowState = {
      id: `${appId}-${Date.now()}`,
      appId,
      title: defaults.title,
      x: 100 + Math.random() * 100,
      y: 50 + Math.random() * 50,
      width: defaults.width,
      height: defaults.height,
      isMinimized: false,
      isMaximized: false,
      zIndex: get().maxZIndex + 1,
    };

    set(state => ({
      windows: [...state.windows, newWindow],
      activeWindowId: newWindow.id,
      maxZIndex: state.maxZIndex + 1,
    }));
  },

  closeWindow: (windowId: string) => {
    set(state => ({
      windows: state.windows.filter(w => w.id !== windowId),
      activeWindowId: state.activeWindowId === windowId
        ? state.windows.filter(w => w.id !== windowId)[0]?.id || null
        : state.activeWindowId,
    }));
  },

  minimizeWindow: (windowId: string) => {
    set(state => ({
      windows: state.windows.map(w =>
        w.id === windowId ? { ...w, isMinimized: true } : w
      ),
      activeWindowId: state.activeWindowId === windowId ? null : state.activeWindowId,
    }));
  },

  maximizeWindow: (windowId: string) => {
    set(state => ({
      windows: state.windows.map(w =>
        w.id === windowId ? { ...w, isMaximized: !w.isMaximized } : w
      ),
    }));
  },

  focusWindow: (windowId: string) => {
    set(state => ({
      windows: state.windows.map(w =>
        w.id === windowId ? { ...w, zIndex: state.maxZIndex + 1 } : w
      ),
      activeWindowId: windowId,
      maxZIndex: state.maxZIndex + 1,
    }));
  },

  updateWindowPosition: (windowId: string, x: number, y: number) => {
    set(state => ({
      windows: state.windows.map(w =>
        w.id === windowId ? { ...w, x, y } : w
      ),
    }));
  },

  updateWindowSize: (windowId: string, width: number, height: number) => {
    set(state => ({
      windows: state.windows.map(w =>
        w.id === windowId ? { ...w, width, height } : w
      ),
    }));
  },

  updateSystemStatus: (status: Partial<SystemStatus>) => {
    set(state => ({
      systemStatus: { ...state.systemStatus, ...status },
    }));
  },

  updateTime: () => {
    set({ currentTime: new Date() });
  },

  setSettingsMode: (mode: SettingsMode) => {
    set({ settingsMode: mode });
  },

  addMessage: (message) => {
    const newMessage: Message = {
      ...message,
      id: `msg-${Date.now()}`,
      timestamp: new Date(),
    };
    set(state => ({
      messages: [...state.messages, newMessage],
    }));
  },

  toggleSkillInstall: (skillId: string) => {
    set(state => ({
      skills: state.skills.map(s =>
        s.id === skillId ? { ...s, installed: !s.installed } : s
      ),
    }));
  },

  toggleAppInstall: (appId: string) => {
    set(state => ({
      appStoreItems: state.appStoreItems.map(a =>
        a.id === appId ? { ...a, installed: !a.installed } : a
      ),
    }));
  },

  executeCommand: (command: string) => {
    const responses: Record<string, string[]> = {
      help: [
        'Available commands:',
        '  help     - Show this help message',
        '  clear    - Clear terminal output',
        '  status   - Show system status',
        '  skills   - List installed skills',
        '  agents   - List active agents',
        '  whoami   - Display current user',
        '  date     - Show current date and time',
        '  cowsay   - Fun cow ASCII art',
        '  matrix   - Enter the matrix',
        '  fortune  - Get a random fortune',
        '',
      ],
      clear: [],
      status: [
        '┌─────────────────────────────────┐',
        '│     MoltOS System Status        │',
        '├─────────────────────────────────┤',
        `│  CPU:     ${get().systemStatus.cpu}%                    │`,
        `│  Memory:  ${get().systemStatus.memory}%                    │`,
        `│  Disk:    ${get().systemStatus.disk}%                    │`,
        `│  Clawdbot: ${get().systemStatus.clawdbotStatus}             │`,
        '└─────────────────────────────────┘',
        '',
      ],
      skills: [
        'Installed Skills:',
        ...get().skills.filter(s => s.installed).map(s => `  ${s.icon} ${s.name}`),
        '',
      ],
      agents: [
        'Active Agents:',
        ...get().agents.map(a => `  [${a.status === 'active' ? '●' : a.status === 'idle' ? '○' : '✗'}] ${a.name} (${a.type})`),
        '',
      ],
      whoami: ['moltbot@moltos', ''],
      date: [new Date().toLocaleString(), ''],
      cowsay: [
        ' _________________',
        '< Moo! I\'m Clawdbot! >',
        ' -----------------',
        '        \\   ^__^',
        '         \\  (oo)\\_______',
        '            (__)\\       )\\/\\',
        '                ||----w |',
        '                ||     ||',
        '',
      ],
      matrix: [
        '01001101 01001111 01001100 01010100 01001111 01010011',
        'Wake up, Neo...',
        'The Matrix has you...',
        'Follow the white rabbit.',
        '',
      ],
      fortune: [
        '🔮 ' + [
          'You will write bug-free code today!',
          'An unexpected merge conflict will teach you patience.',
          'Your next commit will be legendary.',
          'Documentation is in your future.',
          'A wild bug appears! But you shall defeat it.',
        ][Math.floor(Math.random() * 5)],
        '',
      ],
    };

    const cmd = command.trim().toLowerCase();

    if (cmd === 'clear') {
      set({ terminalOutput: [], terminalHistory: [...get().terminalHistory, command] });
      return;
    }

    const output = responses[cmd] || [`Command not found: ${command}`, 'Type "help" for available commands.', ''];

    set(state => ({
      terminalOutput: [...state.terminalOutput, `moltbot@moltos ~ % ${command}`, ...output],
      terminalHistory: [...state.terminalHistory, command],
    }));
  },

  clearTerminal: () => {
    set({ terminalOutput: [] });
  },

  addCalendarEvent: (event) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: `event-${Date.now()}`,
    };
    set(state => ({
      calendarEvents: [...state.calendarEvents, newEvent],
    }));
  },

  removeCalendarEvent: (eventId: string) => {
    set(state => ({
      calendarEvents: state.calendarEvents.filter(e => e.id !== eventId),
    }));
  },

  toggleEmailRead: (emailId: string) => {
    set(state => ({
      emails: state.emails.map(e =>
        e.id === emailId ? { ...e, read: !e.read } : e
      ),
    }));
  },

  toggleEmailStar: (emailId: string) => {
    set(state => ({
      emails: state.emails.map(e =>
        e.id === emailId ? { ...e, starred: !e.starred } : e
      ),
    }));
  },

  toggleAgentStatus: (agentId: string) => {
    set(state => ({
      agents: state.agents.map(a =>
        a.id === agentId
          ? { ...a, status: a.status === 'active' ? 'idle' : a.status === 'idle' ? 'offline' : 'active', lastActive: new Date() }
          : a
      ),
    }));
  },

  // MoltBot Actions
  setMoltbotStatus: (status: MoltBotStatus) => {
    set({ moltbotStatus: status });
    // Update clawdbot status in system status based on moltbot connection
    if (status.isGatewayRunning) {
      set(state => ({
        systemStatus: { ...state.systemStatus, clawdbotStatus: 'connected' },
      }));
    }
  },

  updateMoltbotInstallStatus: (status: MoltBotInstallStatus) => {
    set(state => ({
      moltbotStatus: { ...state.moltbotStatus, installStatus: status },
    }));
  },

  setShowSetupWizard: (show: boolean) => {
    set({ showSetupWizard: show });
  },

  completeSetup: () => {
    localStorage.setItem('moltos_setup_complete', 'true');
    set({
      hasCompletedSetup: true,
      showSetupWizard: false,
    });
  },
}));

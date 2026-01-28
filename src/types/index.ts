export type AppId =
  | 'chat'
  | 'apps'
  | 'skills'
  | 'monitor'
  | 'terminal'
  | 'files'
  | 'calendar'
  | 'mail'
  | 'agents'
  | 'settings';

export interface AppInfo {
  id: AppId;
  name: string;
  icon: string;
  color: string;
}

export interface WindowState {
  id: string;
  appId: AppId;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  usage: string;
  icon: string;
  category: string;
  installed: boolean;
}

export interface AppStoreItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rating: number;
  downloads: string;
  installed: boolean;
  developer: string;
}

export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  modified: Date;
  path: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time?: string;
  color: string;
}

export interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  date: Date;
  read: boolean;
  starred: boolean;
}

export interface Agent {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'offline';
  type: string;
  description: string;
  lastActive: Date;
}

export interface SystemStatus {
  cpu: number;
  memory: number;
  disk: number;
  network: {
    upload: number;
    download: number;
  };
  clawdbotStatus: 'connected' | 'disconnected' | 'connecting';
  battery: number;
  wifi: 'connected' | 'disconnected';
}

export type SettingsMode = 'simple' | 'pro';

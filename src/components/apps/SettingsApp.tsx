import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDesktopStore } from '@/store';
import {
  User,
  Bell,
  Palette,
  Shield,
  Globe,
  Keyboard,
  Monitor,
  Volume2,
  Wifi,
  Battery,
  Moon,
  Zap,
  ChevronRight,
} from 'lucide-react';

type SettingsCategory = 'general' | 'appearance' | 'notifications' | 'privacy' | 'network' | 'about';

export function SettingsApp() {
  const { settingsMode, setSettingsMode, systemStatus } = useDesktopStore();
  const [selectedCategory, setSelectedCategory] = useState<SettingsCategory>('general');
  const [settings, setSettings] = useState({
    darkMode: true,
    notifications: true,
    sounds: true,
    analytics: false,
    autoUpdate: true,
    reducedMotion: false,
    language: 'English',
  });

  const categories = [
    { id: 'general', label: 'General', icon: <Monitor className="w-5 h-5" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="w-5 h-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
    { id: 'privacy', label: 'Privacy & Security', icon: <Shield className="w-5 h-5" /> },
    { id: 'network', label: 'Network', icon: <Globe className="w-5 h-5" /> },
    { id: 'about', label: 'About', icon: <User className="w-5 h-5" /> },
  ];

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderSimpleSettings = () => (
    <div className="p-6 space-y-6">
      {/* Quick Settings */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => toggleSetting('darkMode')}
          className={`p-4 rounded-xl border transition-all ${
            settings.darkMode
              ? 'bg-blue-500/20 border-blue-500/50'
              : 'bg-white/5 border-white/10 hover:bg-white/10'
          }`}
        >
          <Moon className="w-6 h-6 text-blue-400 mb-2" />
          <p className="text-white font-medium">Dark Mode</p>
          <p className="text-xs text-white/50 mt-1">{settings.darkMode ? 'On' : 'Off'}</p>
        </button>

        <button
          onClick={() => toggleSetting('notifications')}
          className={`p-4 rounded-xl border transition-all ${
            settings.notifications
              ? 'bg-green-500/20 border-green-500/50'
              : 'bg-white/5 border-white/10 hover:bg-white/10'
          }`}
        >
          <Bell className="w-6 h-6 text-green-400 mb-2" />
          <p className="text-white font-medium">Notifications</p>
          <p className="text-xs text-white/50 mt-1">{settings.notifications ? 'On' : 'Off'}</p>
        </button>

        <button
          onClick={() => toggleSetting('sounds')}
          className={`p-4 rounded-xl border transition-all ${
            settings.sounds
              ? 'bg-purple-500/20 border-purple-500/50'
              : 'bg-white/5 border-white/10 hover:bg-white/10'
          }`}
        >
          <Volume2 className="w-6 h-6 text-purple-400 mb-2" />
          <p className="text-white font-medium">Sounds</p>
          <p className="text-xs text-white/50 mt-1">{settings.sounds ? 'On' : 'Off'}</p>
        </button>

        <button
          onClick={() => toggleSetting('autoUpdate')}
          className={`p-4 rounded-xl border transition-all ${
            settings.autoUpdate
              ? 'bg-orange-500/20 border-orange-500/50'
              : 'bg-white/5 border-white/10 hover:bg-white/10'
          }`}
        >
          <Zap className="w-6 h-6 text-orange-400 mb-2" />
          <p className="text-white font-medium">Auto Update</p>
          <p className="text-xs text-white/50 mt-1">{settings.autoUpdate ? 'On' : 'Off'}</p>
        </button>
      </div>

      {/* System Status */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <h3 className="text-white font-medium mb-3">System Status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-white/50" />
              <span className="text-white/70">Network</span>
            </div>
            <span className={`text-sm ${systemStatus.wifi === 'connected' ? 'text-green-400' : 'text-red-400'}`}>
              {systemStatus.wifi === 'connected' ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Battery className="w-4 h-4 text-white/50" />
              <span className="text-white/70">Battery</span>
            </div>
            <span className="text-sm text-white">{systemStatus.battery}%</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProSettings = () => (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-56 border-r border-white/10 p-3 bg-black/20">
        <div className="space-y-1">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as SettingsCategory)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-white/70 hover:bg-white/5'
              }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <motion.div
          key={selectedCategory}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {selectedCategory === 'general' && (
            <>
              <h2 className="text-xl font-semibold text-white mb-6">General Settings</h2>
              <div className="space-y-4">
                <SettingRow
                  icon={<Globe className="w-5 h-5" />}
                  label="Language"
                  description="Choose your preferred language"
                  value={settings.language}
                  type="select"
                />
                <SettingRow
                  icon={<Zap className="w-5 h-5" />}
                  label="Auto Update"
                  description="Automatically install updates"
                  value={settings.autoUpdate}
                  type="toggle"
                  onToggle={() => toggleSetting('autoUpdate')}
                />
                <SettingRow
                  icon={<Keyboard className="w-5 h-5" />}
                  label="Keyboard Shortcuts"
                  description="View and customize shortcuts"
                  type="action"
                />
              </div>
            </>
          )}

          {selectedCategory === 'appearance' && (
            <>
              <h2 className="text-xl font-semibold text-white mb-6">Appearance</h2>
              <div className="space-y-4">
                <SettingRow
                  icon={<Moon className="w-5 h-5" />}
                  label="Dark Mode"
                  description="Use dark theme throughout the app"
                  value={settings.darkMode}
                  type="toggle"
                  onToggle={() => toggleSetting('darkMode')}
                />
                <SettingRow
                  icon={<Monitor className="w-5 h-5" />}
                  label="Reduced Motion"
                  description="Minimize animations and transitions"
                  value={settings.reducedMotion}
                  type="toggle"
                  onToggle={() => toggleSetting('reducedMotion')}
                />
              </div>
            </>
          )}

          {selectedCategory === 'notifications' && (
            <>
              <h2 className="text-xl font-semibold text-white mb-6">Notifications</h2>
              <div className="space-y-4">
                <SettingRow
                  icon={<Bell className="w-5 h-5" />}
                  label="Push Notifications"
                  description="Receive notifications for updates"
                  value={settings.notifications}
                  type="toggle"
                  onToggle={() => toggleSetting('notifications')}
                />
                <SettingRow
                  icon={<Volume2 className="w-5 h-5" />}
                  label="Sound Effects"
                  description="Play sounds for notifications"
                  value={settings.sounds}
                  type="toggle"
                  onToggle={() => toggleSetting('sounds')}
                />
              </div>
            </>
          )}

          {selectedCategory === 'privacy' && (
            <>
              <h2 className="text-xl font-semibold text-white mb-6">Privacy & Security</h2>
              <div className="space-y-4">
                <SettingRow
                  icon={<Shield className="w-5 h-5" />}
                  label="Analytics"
                  description="Help improve MoltOS by sharing usage data"
                  value={settings.analytics}
                  type="toggle"
                  onToggle={() => toggleSetting('analytics')}
                />
              </div>
            </>
          )}

          {selectedCategory === 'network' && (
            <>
              <h2 className="text-xl font-semibold text-white mb-6">Network</h2>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-white font-medium">Wi-Fi</p>
                    <p className="text-sm text-white/50">MoltOS-Network</p>
                  </div>
                  <span className="text-green-400">Connected</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-4/5 bg-green-500 rounded-full" />
                </div>
                <p className="text-xs text-white/40 mt-2">Signal strength: Excellent</p>
              </div>
            </>
          )}

          {selectedCategory === 'about' && (
            <>
              <h2 className="text-xl font-semibold text-white mb-6">About MoltOS</h2>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-3xl">🦀</span>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">MoltOS</h3>
                      <p className="text-white/50">Version 1.0.0</p>
                      <p className="text-xs text-white/30 mt-1">Built with React, TypeScript & Love</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-sm text-white/60">
                    MoltOS is a macOS-inspired desktop environment designed for Moltbot,
                    featuring seamless integration with Clawdhub, Crabwalk, and AgentMail.
                  </p>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Mode Toggle */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h2 className="text-lg font-semibold text-white">Settings</h2>
        <div className="flex items-center gap-2 p-1 rounded-lg bg-white/5">
          <button
            onClick={() => setSettingsMode('simple')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              settingsMode === 'simple'
                ? 'bg-blue-500 text-white'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Simple
          </button>
          <button
            onClick={() => setSettingsMode('pro')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              settingsMode === 'pro'
                ? 'bg-blue-500 text-white'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Pro
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {settingsMode === 'simple' ? renderSimpleSettings() : renderProSettings()}
      </div>
    </div>
  );
}

interface SettingRowProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  value?: boolean | string;
  type: 'toggle' | 'select' | 'action';
  onToggle?: () => void;
}

function SettingRow({ icon, label, description, value, type, onToggle }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
      <div className="flex items-center gap-3">
        <div className="text-white/50">{icon}</div>
        <div>
          <p className="text-white font-medium">{label}</p>
          {description && <p className="text-sm text-white/50">{description}</p>}
        </div>
      </div>
      {type === 'toggle' && (
        <button
          onClick={onToggle}
          className={`w-11 h-6 rounded-full transition-colors ${
            value ? 'bg-blue-500' : 'bg-white/20'
          }`}
        >
          <motion.div
            className="w-5 h-5 rounded-full bg-white shadow-md mx-0.5"
            animate={{ x: value ? 20 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </button>
      )}
      {type === 'select' && (
        <div className="flex items-center gap-2 text-white/70">
          <span className="text-sm">{value}</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      )}
      {type === 'action' && (
        <ChevronRight className="w-5 h-5 text-white/30" />
      )}
    </div>
  );
}

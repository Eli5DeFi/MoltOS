import { motion } from 'framer-motion';
import { useDesktopStore } from '@/store';
import type { AppId } from '@/types';
import {
  MessageSquare,
  LayoutGrid,
  Sparkles,
  Activity,
  Terminal,
  FolderOpen,
  Calendar,
  Mail,
  Bot,
  Settings
} from 'lucide-react';

interface DockApp {
  id: AppId;
  name: string;
  icon: React.ReactNode;
  color: string;
}

const dockApps: DockApp[] = [
  { id: 'chat', name: 'Chat', icon: <MessageSquare className="w-7 h-7" />, color: 'from-blue-500 to-blue-600' },
  { id: 'apps', name: 'Apps', icon: <LayoutGrid className="w-7 h-7" />, color: 'from-cyan-400 to-blue-500' },
  { id: 'skills', name: 'Skills', icon: <Sparkles className="w-7 h-7" />, color: 'from-purple-500 to-pink-500' },
  { id: 'monitor', name: 'Monitor', icon: <Activity className="w-7 h-7" />, color: 'from-red-500 to-orange-500' },
  { id: 'terminal', name: 'Terminal', icon: <Terminal className="w-7 h-7" />, color: 'from-gray-700 to-gray-900' },
  { id: 'files', name: 'Files', icon: <FolderOpen className="w-7 h-7" />, color: 'from-blue-400 to-cyan-400' },
  { id: 'calendar', name: 'Calendar', icon: <Calendar className="w-7 h-7" />, color: 'from-red-400 to-red-500' },
  { id: 'mail', name: 'Mail', icon: <Mail className="w-7 h-7" />, color: 'from-blue-500 to-indigo-500' },
  { id: 'agents', name: 'Agents', icon: <Bot className="w-7 h-7" />, color: 'from-green-500 to-emerald-500' },
  { id: 'settings', name: 'Settings', icon: <Settings className="w-7 h-7" />, color: 'from-gray-500 to-gray-600' },
];

export function Dock() {
  const { windows, openWindow } = useDesktopStore();

  const isAppOpen = (appId: AppId) => windows.some(w => w.appId === appId);

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[9998]"
    >
      <div className="flex items-end gap-2 px-3 py-2 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl shadow-black/30">
        {dockApps.map((app) => (
          <DockIcon
            key={app.id}
            app={app}
            isOpen={isAppOpen(app.id)}
            onClick={() => openWindow(app.id)}
          />
        ))}
      </div>
    </motion.div>
  );
}

interface DockIconProps {
  app: DockApp;
  isOpen: boolean;
  onClick: () => void;
}

function DockIcon({ app, isOpen, onClick }: DockIconProps) {
  return (
    <motion.button
      onClick={onClick}
      className="relative flex flex-col items-center group"
      whileHover={{ scale: 1.2, y: -8 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileHover={{ opacity: 1, y: 0 }}
        className="absolute -top-10 px-3 py-1.5 rounded-lg bg-gray-800/90 backdrop-blur text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
      >
        {app.name}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800/90" />
      </motion.div>

      {/* Icon */}
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${app.color} flex items-center justify-center text-white shadow-lg shadow-black/20 transition-shadow group-hover:shadow-xl group-hover:shadow-black/30`}>
        {app.icon}
      </div>

      {/* Active indicator */}
      {isOpen && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-white/80"
        />
      )}
    </motion.button>
  );
}

import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
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
  gradientFrom: string;
  gradientTo: string;
}

// iOS 4 style colors - vibrant and glossy
const dockApps: DockApp[] = [
  { id: 'chat', name: 'Chat', icon: <MessageSquare className="w-7 h-7" />, color: 'from-[#1E90FF] to-[#0066CC]', gradientFrom: '#1E90FF', gradientTo: '#0066CC' },
  { id: 'apps', name: 'Apps', icon: <LayoutGrid className="w-7 h-7" />, color: 'from-[#00D4FF] to-[#0099CC]', gradientFrom: '#00D4FF', gradientTo: '#0099CC' },
  { id: 'skills', name: 'Skills', icon: <Sparkles className="w-7 h-7" />, color: 'from-[#FF6B9D] to-[#C44569]', gradientFrom: '#FF6B9D', gradientTo: '#C44569' },
  { id: 'monitor', name: 'Monitor', icon: <Activity className="w-7 h-7" />, color: 'from-[#FF6B35] to-[#CC4400]', gradientFrom: '#FF6B35', gradientTo: '#CC4400' },
  { id: 'terminal', name: 'Terminal', icon: <Terminal className="w-7 h-7" />, color: 'from-[#2D2D2D] to-[#1A1A1A]', gradientFrom: '#2D2D2D', gradientTo: '#1A1A1A' },
  { id: 'files', name: 'Files', icon: <FolderOpen className="w-7 h-7" />, color: 'from-[#5AC8FA] to-[#007AFF]', gradientFrom: '#5AC8FA', gradientTo: '#007AFF' },
  { id: 'calendar', name: 'Calendar', icon: <Calendar className="w-7 h-7" />, color: 'from-[#FF3B30] to-[#CC2D24]', gradientFrom: '#FF3B30', gradientTo: '#CC2D24' },
  { id: 'mail', name: 'Mail', icon: <Mail className="w-7 h-7" />, color: 'from-[#5856D6] to-[#3634A3]', gradientFrom: '#5856D6', gradientTo: '#3634A3' },
  { id: 'agents', name: 'Agents', icon: <Bot className="w-7 h-7" />, color: 'from-[#34C759] to-[#248A3D]', gradientFrom: '#34C759', gradientTo: '#248A3D' },
  { id: 'settings', name: 'Settings', icon: <Settings className="w-7 h-7" />, color: 'from-[#8E8E93] to-[#636366]', gradientFrom: '#8E8E93', gradientTo: '#636366' },
];

export function Dock() {
  const { windows, openWindow } = useDesktopStore();
  const mouseX = useMotionValue(Infinity);

  const isAppOpen = (appId: AppId) => windows.some(w => w.appId === appId);

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[9998]"
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
    >
      <motion.div
        className="flex items-end gap-1 px-3 py-2 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl shadow-black/30"
        layout
      >
        {dockApps.map((app, i) => (
          <DockIcon
            key={app.id}
            app={app}
            isOpen={isAppOpen(app.id)}
            onClick={() => openWindow(app.id)}
            mouseX={mouseX}
            index={i}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

interface DockIconProps {
  app: DockApp;
  isOpen: boolean;
  onClick: () => void;
  mouseX: ReturnType<typeof useMotionValue<number>>;
  index: number;
}

function DockIcon({ app, isOpen, onClick, mouseX, index }: DockIconProps) {
  const ref = useRef<HTMLButtonElement>(null);

  // Calculate distance from mouse for magnification
  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  // Magnification effect - scale based on distance
  const baseSize = 56;
  const maxSize = 80;
  const magnificationRange = 150;

  const size = useSpring(
    useTransform(distance, [-magnificationRange, 0, magnificationRange], [baseSize, maxSize, baseSize]),
    { mass: 0.1, stiffness: 150, damping: 12 }
  );

  const y = useSpring(
    useTransform(distance, [-magnificationRange, 0, magnificationRange], [0, -12, 0]),
    { mass: 0.1, stiffness: 150, damping: 12 }
  );

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      className="relative flex flex-col items-center group"
      style={{ width: size, height: size, y }}
      whileTap={{ scale: 0.9 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.8 }}
        whileHover={{ opacity: 1, y: 0, scale: 1 }}
        className="absolute -top-12 px-3 py-1.5 rounded-lg bg-gray-800/95 backdrop-blur-xl text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50"
        style={{
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}
      >
        {app.name}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800/95" />
      </motion.div>

      {/* iOS 4 Style Icon with Glossy Effect */}
      <motion.div
        className="relative w-full h-full rounded-[12px] flex items-center justify-center text-white overflow-hidden"
        style={{
          background: `linear-gradient(180deg, ${app.gradientFrom} 0%, ${app.gradientTo} 100%)`,
          boxShadow: `
            0 1px 3px rgba(0,0,0,0.3),
            0 4px 8px rgba(0,0,0,0.2),
            0 8px 16px rgba(0,0,0,0.15),
            inset 0 1px 0 rgba(255,255,255,0.4),
            inset 0 -1px 0 rgba(0,0,0,0.2)
          `,
        }}
        whileHover={{
          boxShadow: `
            0 2px 6px rgba(0,0,0,0.3),
            0 8px 16px rgba(0,0,0,0.25),
            0 16px 32px rgba(0,0,0,0.2),
            inset 0 1px 0 rgba(255,255,255,0.5),
            inset 0 -1px 0 rgba(0,0,0,0.2)
          `,
        }}
      >
        {/* Animated shine sweep on hover */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100"
          initial={false}
          style={{
            background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)',
            backgroundSize: '200% 100%',
          }}
          whileHover={{
            backgroundPosition: ['200% 0', '-200% 0'],
          }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        />

        {/* Top glossy shine - iOS 4 signature effect */}
        <div
          className="absolute inset-x-0 top-0 h-[45%] rounded-t-[11px]"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0) 100%)',
          }}
        />

        {/* Inner glow */}
        <div
          className="absolute inset-[1px] rounded-[11px]"
          style={{
            boxShadow: 'inset 0 0 12px rgba(255,255,255,0.2)',
          }}
        />

        {/* Icon with bounce animation */}
        <motion.div
          className="relative z-10 drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9, rotate: -5 }}
        >
          {app.icon}
        </motion.div>

        {/* Bottom reflection line */}
        <div
          className="absolute bottom-0 inset-x-0 h-[1px]"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
          }}
        />
      </motion.div>

      {/* Active indicator - animated glowing dot */}
      {isOpen && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute -bottom-2 w-1.5 h-1.5 rounded-full bg-white"
          style={{
            boxShadow: '0 0 8px rgba(255,255,255,0.9), 0 0 16px rgba(255,255,255,0.5)',
          }}
        >
          {/* Pulse animation */}
          <motion.div
            className="absolute inset-0 rounded-full bg-white"
            animate={{
              scale: [1, 1.8, 1],
              opacity: [0.8, 0, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>
      )}
    </motion.button>
  );
}

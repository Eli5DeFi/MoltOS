import { useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDesktopStore } from '@/store';
import type { WindowState } from '@/types';
import { ChatApp } from '@/components/apps/ChatApp';
import { AppsApp } from '@/components/apps/AppsApp';
import { SkillsApp } from '@/components/apps/SkillsApp';
import { MonitorApp } from '@/components/apps/MonitorApp';
import { TerminalApp } from '@/components/apps/TerminalApp';
import { FilesApp } from '@/components/apps/FilesApp';
import { CalendarApp } from '@/components/apps/CalendarApp';
import { MailApp } from '@/components/apps/MailApp';
import { AgentsApp } from '@/components/apps/AgentsApp';
import { SettingsApp } from '@/components/apps/SettingsApp';

interface WindowProps {
  window: WindowState;
}

const appComponents: Record<string, React.ComponentType> = {
  chat: ChatApp,
  apps: AppsApp,
  skills: SkillsApp,
  monitor: MonitorApp,
  terminal: TerminalApp,
  files: FilesApp,
  calendar: CalendarApp,
  mail: MailApp,
  agents: AgentsApp,
  settings: SettingsApp,
};

// Window open animation variants
const windowVariants = {
  initial: {
    scale: 0.5,
    opacity: 0,
    y: 50,
    rotateX: 15,
  },
  animate: {
    scale: 1,
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 25,
      mass: 0.8,
    },
  },
  exit: {
    scale: 0.8,
    opacity: 0,
    y: 30,
    transition: {
      duration: 0.2,
      ease: 'easeIn' as const,
    },
  },
  minimized: {
    scale: 0.1,
    opacity: 0,
    y: 400,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
    },
  },
};

export function Window({ window: win }: WindowProps) {
  const { closeWindow, minimizeWindow, maximizeWindow, focusWindow, updateWindowPosition, activeWindowId } = useDesktopStore();
  const windowRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHoveringControls, setIsHoveringControls] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, winX: 0, winY: 0 });

  const isActive = activeWindowId === win.id;
  const AppComponent = appComponents[win.appId];

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.window-controls')) return;

    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      winX: win.x,
      winY: win.y,
    };
    focusWindow(win.id);
  }, [focusWindow, win.id, win.x, win.y]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    updateWindowPosition(
      win.id,
      dragStartRef.current.winX + deltaX,
      Math.max(28, dragStartRef.current.winY + deltaY)
    );
  }, [isDragging, updateWindowPosition, win.id]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Attach global mouse events for dragging
  const handleTitleBarMouseDown = useCallback((e: React.MouseEvent) => {
    handleMouseDown(e);

    const onMove = (e: MouseEvent) => handleMouseMove(e);
    const onUp = () => {
      handleMouseUp();
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [handleMouseDown, handleMouseMove, handleMouseUp]);

  const windowStyle = win.isMaximized
    ? { top: 28, left: 0, right: 0, bottom: 80, width: 'auto', height: 'auto' }
    : { top: win.y, left: win.x, width: win.width, height: win.height };

  return (
    <AnimatePresence mode="wait">
      {!win.isMinimized && (
        <motion.div
          ref={windowRef}
          variants={windowVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{
            ...windowStyle,
            zIndex: win.zIndex,
            position: 'absolute',
            perspective: 1000,
          }}
          className={`flex flex-col rounded-xl overflow-hidden ${
            isActive
              ? 'shadow-2xl shadow-black/50 ring-1 ring-white/10'
              : 'shadow-xl shadow-black/30'
          }`}
          onClick={() => !isActive && focusWindow(win.id)}
          whileHover={!isActive ? { scale: 1.002 } : undefined}
          transition={{ duration: 0.2 }}
          layout
        >
          {/* Glassmorphism background glow */}
          <motion.div
            className="absolute -inset-[1px] rounded-xl opacity-0"
            animate={{
              opacity: isActive ? 0.15 : 0,
            }}
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05))',
            }}
          />

          {/* Title Bar */}
          <motion.div
            onMouseDown={handleTitleBarMouseDown}
            className={`flex items-center h-11 px-3 border-b border-white/5 cursor-default select-none backdrop-blur-xl relative overflow-hidden`}
            animate={{
              backgroundColor: isActive ? 'rgba(55,55,55,0.98)' : 'rgba(45,45,45,0.95)',
            }}
            transition={{ duration: 0.2 }}
          >
            {/* Subtle gradient overlay on title bar */}
            <div
              className="absolute inset-0 opacity-50"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)',
              }}
            />

            {/* Traffic lights */}
            <div
              className="window-controls flex items-center gap-2 mr-4 relative z-10"
              onMouseEnter={() => setIsHoveringControls(true)}
              onMouseLeave={() => setIsHoveringControls(false)}
            >
              <motion.button
                onClick={() => closeWindow(win.id)}
                className="group w-3 h-3 rounded-full bg-[#ff5f57] flex items-center justify-center"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
              >
                <motion.svg
                  className="w-2 h-2 text-[#820005]"
                  viewBox="0 0 12 12"
                  fill="currentColor"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isHoveringControls ? 1 : 0 }}
                >
                  <path d="M3.172 3.172a.5.5 0 0 1 .707 0L6 5.293l2.121-2.121a.5.5 0 0 1 .707.707L6.707 6l2.121 2.121a.5.5 0 0 1-.707.707L6 6.707 3.879 8.828a.5.5 0 0 1-.707-.707L5.293 6 3.172 3.879a.5.5 0 0 1 0-.707z"/>
                </motion.svg>
              </motion.button>
              <motion.button
                onClick={() => minimizeWindow(win.id)}
                className="group w-3 h-3 rounded-full bg-[#febc2e] flex items-center justify-center"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
              >
                <motion.svg
                  className="w-2 h-2 text-[#9a6800]"
                  viewBox="0 0 12 12"
                  fill="currentColor"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isHoveringControls ? 1 : 0 }}
                >
                  <path d="M2 6a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 2 6z"/>
                </motion.svg>
              </motion.button>
              <motion.button
                onClick={() => maximizeWindow(win.id)}
                className="group w-3 h-3 rounded-full bg-[#28c840] flex items-center justify-center"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
              >
                <motion.svg
                  className="w-2 h-2 text-[#006500]"
                  viewBox="0 0 12 12"
                  fill="currentColor"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isHoveringControls ? 1 : 0 }}
                >
                  {win.isMaximized ? (
                    <path d="M3.5 8.5h5v-5h-5v5zm.5-4.5h4v4H4V4z"/>
                  ) : (
                    <path d="M3 3v6h6V3H3zm5 5H4V4h4v4z"/>
                  )}
                </motion.svg>
              </motion.button>
            </div>

            {/* Title */}
            <div className="flex-1 text-center relative z-10">
              <motion.span
                className="text-sm font-medium"
                animate={{
                  color: isActive ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)',
                }}
              >
                {win.title}
              </motion.span>
            </div>

            {/* Spacer for balance */}
            <div className="w-16" />
          </motion.div>

          {/* Content */}
          <motion.div
            className="flex-1 bg-[rgba(30,30,32,0.98)] overflow-hidden relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            {/* Content fade-in overlay */}
            <motion.div
              className="absolute inset-0 bg-black pointer-events-none"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
            />
            {AppComponent && <AppComponent />}
          </motion.div>

          {/* Bottom border glow when active */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-[1px]"
            animate={{
              opacity: isActive ? 1 : 0,
              background: isActive
                ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)'
                : 'transparent',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { useRef, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
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

export function Window({ window: win }: WindowProps) {
  const { closeWindow, minimizeWindow, maximizeWindow, focusWindow, updateWindowPosition, activeWindowId } = useDesktopStore();
  const windowRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
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

  if (win.isMinimized) return null;

  const windowStyle = win.isMaximized
    ? { top: 28, left: 0, right: 0, bottom: 80, width: 'auto', height: 'auto' }
    : { top: win.y, left: win.x, width: win.width, height: win.height };

  return (
    <motion.div
      ref={windowRef}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      style={{
        ...windowStyle,
        zIndex: win.zIndex,
        position: 'absolute',
      }}
      className={`flex flex-col rounded-xl overflow-hidden shadow-2xl ${
        isActive ? 'shadow-black/40' : 'shadow-black/20'
      }`}
      onClick={() => !isActive && focusWindow(win.id)}
    >
      {/* Title Bar */}
      <div
        onMouseDown={handleTitleBarMouseDown}
        className={`flex items-center h-11 px-3 ${
          isActive
            ? 'bg-[rgba(55,55,55,0.98)]'
            : 'bg-[rgba(45,45,45,0.98)]'
        } border-b border-white/5 cursor-default select-none`}
      >
        {/* Traffic lights */}
        <div className="window-controls flex items-center gap-2 mr-4">
          <button
            onClick={() => closeWindow(win.id)}
            className="group w-3 h-3 rounded-full bg-[#ff5f57] hover:bg-[#ff5f57] flex items-center justify-center transition-colors"
          >
            <svg className="w-2 h-2 opacity-0 group-hover:opacity-100 text-[#820005]" viewBox="0 0 12 12" fill="currentColor">
              <path d="M3.172 3.172a.5.5 0 0 1 .707 0L6 5.293l2.121-2.121a.5.5 0 0 1 .707.707L6.707 6l2.121 2.121a.5.5 0 0 1-.707.707L6 6.707 3.879 8.828a.5.5 0 0 1-.707-.707L5.293 6 3.172 3.879a.5.5 0 0 1 0-.707z"/>
            </svg>
          </button>
          <button
            onClick={() => minimizeWindow(win.id)}
            className="group w-3 h-3 rounded-full bg-[#febc2e] hover:bg-[#febc2e] flex items-center justify-center transition-colors"
          >
            <svg className="w-2 h-2 opacity-0 group-hover:opacity-100 text-[#9a6800]" viewBox="0 0 12 12" fill="currentColor">
              <path d="M2 6a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 2 6z"/>
            </svg>
          </button>
          <button
            onClick={() => maximizeWindow(win.id)}
            className="group w-3 h-3 rounded-full bg-[#28c840] hover:bg-[#28c840] flex items-center justify-center transition-colors"
          >
            <svg className="w-2 h-2 opacity-0 group-hover:opacity-100 text-[#006500]" viewBox="0 0 12 12" fill="currentColor">
              {win.isMaximized ? (
                <path d="M3.5 8.5h5v-5h-5v5zm.5-4.5h4v4H4V4z"/>
              ) : (
                <path d="M3 3v6h6V3H3zm5 5H4V4h4v4z"/>
              )}
            </svg>
          </button>
        </div>

        {/* Title */}
        <div className="flex-1 text-center">
          <span className={`text-sm font-medium ${isActive ? 'text-white/90' : 'text-white/50'}`}>
            {win.title}
          </span>
        </div>

        {/* Spacer for balance */}
        <div className="w-16" />
      </div>

      {/* Content */}
      <div className="flex-1 bg-[rgba(30,30,32,0.98)] overflow-hidden">
        {AppComponent && <AppComponent />}
      </div>
    </motion.div>
  );
}

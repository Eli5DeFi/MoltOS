import { useDesktopStore } from '@/store';
import { format } from 'date-fns';
import { Wifi, Battery, Activity } from 'lucide-react';

export function MenuBar() {
  const { currentTime, systemStatus, activeWindowId, windows, moltbotStatus, setShowSetupWizard } = useDesktopStore();

  const activeWindow = windows.find(w => w.id === activeWindowId);
  const appName = activeWindow?.title || 'Finder';

  return (
    <div className="fixed top-0 left-0 right-0 h-7 bg-[rgba(30,30,30,0.8)] backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 z-[9999] text-white/90 text-[13px] select-none">
      {/* Left section */}
      <div className="flex items-center gap-5">
        {/* Apple logo */}
        <button className="hover:bg-white/10 px-2 py-0.5 rounded transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
        </button>

        {/* App name */}
        <span className="font-semibold">{appName}</span>

        {/* Menu items */}
        <div className="flex items-center gap-4 text-white/70">
          <button className="hover:text-white transition-colors">File</button>
          <button className="hover:text-white transition-colors">Edit</button>
          <button className="hover:text-white transition-colors">View</button>
          <button className="hover:text-white transition-colors">Window</button>
          <button className="hover:text-white transition-colors">Help</button>
        </div>
      </div>

      {/* Right section - Status indicators */}
      <div className="flex items-center gap-3">
        {/* MoltBot Status */}
        <button
          onClick={() => {
            if (moltbotStatus.installStatus === 'not_installed') {
              setShowSetupWizard(true);
            }
          }}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-white/10 transition-colors cursor-pointer"
        >
          <div className={`w-2 h-2 rounded-full ${
            moltbotStatus.installStatus === 'connected'
              ? 'bg-green-400'
              : moltbotStatus.installStatus === 'configured' || moltbotStatus.installStatus === 'installed'
              ? 'bg-yellow-400'
              : moltbotStatus.installStatus === 'checking'
              ? 'bg-blue-400 animate-pulse'
              : 'bg-red-400'
          }`} />
          <span className="text-xs flex items-center gap-1">
            <span className="hidden sm:inline">🦞</span>
            MoltBot
            {moltbotStatus.installStatus === 'not_installed' && (
              <span className="text-[10px] text-orange-400">(Setup)</span>
            )}
          </span>
        </button>

        {/* Activity */}
        <div className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-white/10 transition-colors cursor-pointer">
          <Activity className="w-3.5 h-3.5" />
          <span className="text-xs">{systemStatus.cpu}%</span>
        </div>

        {/* WiFi */}
        <button className="p-1 rounded hover:bg-white/10 transition-colors">
          <Wifi className={`w-4 h-4 ${systemStatus.wifi === 'connected' ? '' : 'opacity-50'}`} />
        </button>

        {/* Battery */}
        <div className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-white/10 transition-colors cursor-pointer">
          <Battery className="w-4 h-4" />
          <span className="text-xs">{systemStatus.battery}%</span>
        </div>

        {/* Time */}
        <div className="flex items-center gap-2 pl-2">
          <span>{format(currentTime, 'EEE MMM d')}</span>
          <span className="font-medium">{format(currentTime, 'h:mm a')}</span>
        </div>
      </div>
    </div>
  );
}

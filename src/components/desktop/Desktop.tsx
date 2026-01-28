import { useEffect } from 'react';
import { useDesktopStore } from '@/store';
import { MenuBar } from './MenuBar';
import { Dock } from './Dock';
import { Window } from './Window';
import { SetupWizard } from '@/components/SetupWizard';
import { moltbotService } from '@/services/moltbot';

export function Desktop() {
  const { windows, updateTime, showSetupWizard, completeSetup, setShowSetupWizard, setMoltbotStatus, hasCompletedSetup } = useDesktopStore();

  useEffect(() => {
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [updateTime]);

  // Check MoltBot status on mount (if already completed setup)
  useEffect(() => {
    if (hasCompletedSetup) {
      moltbotService.checkInstallation().then(status => {
        setMoltbotStatus(status);
      });
    }
  }, [hasCompletedSetup, setMoltbotStatus]);

  // Simulate system status updates
  useEffect(() => {
    const interval = setInterval(() => {
      useDesktopStore.getState().updateSystemStatus({
        cpu: Math.floor(15 + Math.random() * 25),
        memory: Math.floor(40 + Math.random() * 20),
        network: {
          upload: Math.random() * 3,
          download: Math.random() * 10,
        },
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]">
      {/* Desktop Wallpaper Pattern */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 48, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(0, 212, 255, 0.2) 0%, transparent 40%),
            radial-gradient(circle at 90% 90%, rgba(131, 56, 236, 0.25) 0%, transparent 50%)
          `,
        }}
      />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Menu Bar */}
      <MenuBar />

      {/* Windows */}
      <div className="absolute inset-0 pt-7 pb-20">
        {windows.map((window) => (
          <Window key={window.id} window={window} />
        ))}
      </div>

      {/* Dock */}
      <Dock />

      {/* Setup Wizard */}
      {showSetupWizard && (
        <SetupWizard
          onComplete={completeSetup}
          onSkip={() => {
            setShowSetupWizard(false);
            completeSetup();
          }}
        />
      )}
    </div>
  );
}

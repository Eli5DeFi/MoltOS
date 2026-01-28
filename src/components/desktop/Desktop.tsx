import { useEffect } from 'react';
import { useDesktopStore } from '@/store';
import { MenuBar } from './MenuBar';
import { Dock } from './Dock';
import { Window } from './Window';
import { SetupWizard } from '@/components/SetupWizard';
import { Tutorial } from '@/components/Tutorial';
import { AutoUpdateChecker } from '@/components/UpdateNotification';
import { moltbotService } from '@/services/moltbot';

export function Desktop() {
  const {
    windows,
    updateTime,
    showSetupWizard,
    completeSetup,
    setShowSetupWizard,
    setMoltbotStatus,
    hasCompletedSetup,
    showTutorial,
    completeTutorial,
    setShowTutorial,
  } = useDesktopStore();

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
    <div className="relative h-full w-full overflow-hidden">
      {/* Bright Gradient Wallpaper - macOS Sonoma style */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(135deg,
              #667eea 0%,
              #764ba2 25%,
              #f093fb 50%,
              #f5576c 75%,
              #4facfe 100%
            )
          `,
        }}
      />

      {/* Animated gradient orbs for depth */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 50% at 20% 80%, rgba(255, 200, 87, 0.4) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 20%, rgba(100, 220, 255, 0.5) 0%, transparent 50%),
            radial-gradient(ellipse 50% 60% at 50% 50%, rgba(255, 120, 200, 0.3) 0%, transparent 40%),
            radial-gradient(ellipse 70% 50% at 90% 80%, rgba(120, 80, 255, 0.4) 0%, transparent 50%),
            radial-gradient(ellipse 40% 30% at 10% 30%, rgba(64, 250, 190, 0.35) 0%, transparent 40%)
          `,
        }}
      />

      {/* Subtle noise texture for premium feel */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
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

      {/* Tutorial */}
      {showTutorial && !showSetupWizard && (
        <Tutorial
          onComplete={completeTutorial}
          onSkip={() => {
            setShowTutorial(false);
            completeTutorial();
          }}
        />
      )}

      {/* Auto Update Checker */}
      {hasCompletedSetup && !showSetupWizard && !showTutorial && (
        <AutoUpdateChecker />
      )}
    </div>
  );
}

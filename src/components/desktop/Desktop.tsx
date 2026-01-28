import { useEffect, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useDesktopStore } from '@/store';
import { MenuBar } from './MenuBar';
import { Dock } from './Dock';
import { Window } from './Window';
import { SetupWizard } from '@/components/SetupWizard';
import { Tutorial } from '@/components/Tutorial';
import { AutoUpdateChecker } from '@/components/UpdateNotification';
import { moltbotService } from '@/services/moltbot';

// Cursor trail particle
interface Particle {
  id: number;
  x: number;
  y: number;
  opacity: number;
}

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

  // Mouse position for parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring animation for mouse movement
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // Parallax transforms for different layers
  const orb1X = useTransform(smoothMouseX, [0, window.innerWidth], [30, -30]);
  const orb1Y = useTransform(smoothMouseY, [0, window.innerHeight], [20, -20]);
  const orb2X = useTransform(smoothMouseX, [0, window.innerWidth], [-40, 40]);
  const orb2Y = useTransform(smoothMouseY, [0, window.innerHeight], [-30, 30]);
  const orb3X = useTransform(smoothMouseX, [0, window.innerWidth], [20, -20]);
  const orb3Y = useTransform(smoothMouseY, [0, window.innerHeight], [40, -40]);

  // Cursor trail particles
  const [particles, setParticles] = useState<Particle[]>([]);
  const [particleId, setParticleId] = useState(0);

  // Handle mouse movement
  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);

    // Add cursor trail particle
    setParticleId(prev => prev + 1);
    setParticles(prev => [
      ...prev.slice(-15), // Keep last 15 particles
      { id: particleId, x: e.clientX, y: e.clientY, opacity: 1 }
    ]);
  }, [mouseX, mouseY, particleId]);

  // Fade out particles
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev =>
        prev
          .map(p => ({ ...p, opacity: p.opacity - 0.1 }))
          .filter(p => p.opacity > 0)
      );
    }, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

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
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
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

      {/* Animated Parallax Orbs */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ x: orb1X, y: orb1Y }}
      >
        <div
          className="absolute w-[800px] h-[500px] rounded-full blur-3xl"
          style={{
            left: '10%',
            bottom: '10%',
            background: 'radial-gradient(ellipse, rgba(255, 200, 87, 0.5) 0%, transparent 70%)',
          }}
        />
      </motion.div>

      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ x: orb2X, y: orb2Y }}
      >
        <div
          className="absolute w-[600px] h-[400px] rounded-full blur-3xl"
          style={{
            right: '5%',
            top: '5%',
            background: 'radial-gradient(ellipse, rgba(100, 220, 255, 0.6) 0%, transparent 70%)',
          }}
        />
      </motion.div>

      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ x: orb3X, y: orb3Y }}
      >
        <div
          className="absolute w-[500px] h-[500px] rounded-full blur-3xl"
          style={{
            left: '40%',
            top: '30%',
            background: 'radial-gradient(ellipse, rgba(255, 120, 200, 0.4) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute w-[600px] h-[400px] rounded-full blur-3xl"
          style={{
            right: '0%',
            bottom: '10%',
            background: 'radial-gradient(ellipse, rgba(120, 80, 255, 0.5) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute w-[400px] h-[300px] rounded-full blur-3xl"
          style={{
            left: '0%',
            top: '15%',
            background: 'radial-gradient(ellipse, rgba(64, 250, 190, 0.45) 0%, transparent 70%)',
          }}
        />
      </motion.div>

      {/* Floating particles animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white/20"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, -window.innerHeight - 100],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 10 + Math.random() * 20,
              repeat: Infinity,
              delay: Math.random() * 10,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      {/* Cursor Trail */}
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="fixed pointer-events-none z-[9999]"
          style={{
            left: particle.x - 4,
            top: particle.y - 4,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(255,255,255,${particle.opacity * 0.6}) 0%, rgba(168,85,247,${particle.opacity * 0.4}) 100%)`,
            boxShadow: `0 0 ${10 * particle.opacity}px rgba(168,85,247,${particle.opacity * 0.5})`,
          }}
          initial={{ scale: 1 }}
          animate={{ scale: 0 }}
          transition={{ duration: 0.5 }}
        />
      ))}

      {/* Subtle noise texture for premium feel */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
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

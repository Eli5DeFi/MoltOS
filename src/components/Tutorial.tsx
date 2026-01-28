import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  AppWindow,
  Sparkles,
  Activity,
  Terminal,
  FolderOpen,
  Bot,
  Settings,
  ChevronRight,
  ChevronLeft,
  X,
  Lightbulb,
  ArrowDown,
} from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  highlight?: 'dock' | 'menubar' | 'desktop' | 'moltbot';
  position: 'center' | 'bottom' | 'top' | 'bottom-left';
  tip?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to MoltOS! 🎉',
    description: 'Your AI-powered desktop is ready. Let me give you a quick tour of the key features.',
    icon: <Sparkles className="w-8 h-8" />,
    position: 'center',
  },
  {
    id: 'dock',
    title: 'The Dock',
    description: 'Your apps live here. Click any icon to open an app. Hover to see the app name and enjoy the bounce animation!',
    icon: <AppWindow className="w-8 h-8" />,
    highlight: 'dock',
    position: 'bottom',
    tip: 'Pro tip: You can have multiple apps open at once!',
  },
  {
    id: 'chat',
    title: 'Chat with MoltBot',
    description: 'Click the Chat icon (💬) to start a conversation with your AI assistant. Ask questions, get help with code, or just chat!',
    icon: <MessageSquare className="w-8 h-8" />,
    highlight: 'dock',
    position: 'bottom',
  },
  {
    id: 'apps',
    title: 'App Store & Skills',
    description: 'Browse the App Store (📈) to discover new capabilities. Check Skills (✨) to see what MoltBot can do and how to use each skill.',
    icon: <Sparkles className="w-8 h-8" />,
    highlight: 'dock',
    position: 'bottom',
    tip: 'Click a skill card to flip it and see usage instructions!',
  },
  {
    id: 'monitor',
    title: 'System Monitor',
    description: 'Keep an eye on system performance with Monitor (🔴). See CPU, memory usage, and Crabwalk integration status.',
    icon: <Activity className="w-8 h-8" />,
    highlight: 'dock',
    position: 'bottom',
  },
  {
    id: 'terminal',
    title: 'Terminal Fun',
    description: 'The Terminal (⬛) is your command center. Try commands like "cowsay", "matrix", or "fortune" for some fun!',
    icon: <Terminal className="w-8 h-8" />,
    highlight: 'dock',
    position: 'bottom',
    tip: 'Use arrow keys to navigate command history!',
  },
  {
    id: 'productivity',
    title: 'Stay Productive',
    description: 'Use Files (📁) to browse your workspace, Calendar (📅) to schedule events, and Mail (📧) for AgentMail integration.',
    icon: <FolderOpen className="w-8 h-8" />,
    highlight: 'dock',
    position: 'bottom',
  },
  {
    id: 'agents',
    title: 'Multi-Agent Power',
    description: 'Agents (🤖) lets you manage multiple AI agents. Deploy specialized agents for different tasks!',
    icon: <Bot className="w-8 h-8" />,
    highlight: 'dock',
    position: 'bottom',
  },
  {
    id: 'menubar',
    title: 'Menu Bar Status',
    description: 'The menu bar shows MoltBot connection status, CPU usage, WiFi, battery, and time. Click MoltBot status to access settings.',
    icon: <Activity className="w-8 h-8" />,
    highlight: 'menubar',
    position: 'top',
    tip: 'Green dot = Connected, Yellow = Configured, Red = Needs setup',
  },
  {
    id: 'settings',
    title: 'Customize Your Experience',
    description: 'Open Settings (⚙️) to personalize MoltOS. Switch between Simple and Pro modes for different levels of control.',
    icon: <Settings className="w-8 h-8" />,
    highlight: 'dock',
    position: 'bottom',
  },
  {
    id: 'complete',
    title: "You're All Set! 🚀",
    description: 'Explore, experiment, and enjoy your AI-powered desktop. MoltBot is always here to help!',
    icon: <Sparkles className="w-8 h-8" />,
    position: 'center',
    tip: 'MoltOS will automatically check for updates to keep you current!',
  },
];

interface TutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function Tutorial({ onComplete, onSkip }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = tutorialSteps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === tutorialSteps.length - 1;

  const nextStep = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (!isFirst) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        nextStep();
      } else if (e.key === 'ArrowLeft') {
        prevStep();
      } else if (e.key === 'Escape') {
        onSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep]);

  const getPositionClasses = () => {
    switch (step.position) {
      case 'top':
        return 'top-16 left-1/2 -translate-x-1/2';
      case 'bottom':
        return 'bottom-28 left-1/2 -translate-x-1/2';
      case 'bottom-left':
        return 'bottom-28 left-8';
      case 'center':
      default:
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
    }
  };

  return (
    <div className="fixed inset-0 z-[10000]">
      {/* Overlay with highlight cutouts */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Highlight areas */}
      {step.highlight === 'dock' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-20 mb-2"
        >
          <div className="absolute inset-0 border-2 border-orange-400 rounded-2xl animate-pulse" />
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ repeat: Infinity, duration: 1, repeatType: 'reverse' }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 text-orange-400"
          >
            <ArrowDown className="w-6 h-6" />
          </motion.div>
        </motion.div>
      )}

      {step.highlight === 'menubar' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-0 left-0 right-0 h-7"
        >
          <div className="absolute inset-0 border-2 border-orange-400 animate-pulse" />
        </motion.div>
      )}

      {/* Tutorial Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ duration: 0.3 }}
          className={`absolute ${getPositionClasses()} w-full max-w-md mx-4`}
        >
          <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white">
                  {step.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                  <p className="text-xs text-white/50">Step {currentStep + 1} of {tutorialSteps.length}</p>
                </div>
              </div>
              <button
                onClick={onSkip}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/50 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-5">
              <p className="text-white/80 leading-relaxed">{step.description}</p>

              {step.tip && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-4 flex items-start gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20"
                >
                  <Lightbulb className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-200/80">{step.tip}</p>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 bg-black/20">
              {/* Progress dots */}
              <div className="flex gap-1.5">
                {tutorialSteps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentStep(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === currentStep
                        ? 'bg-orange-500 w-6'
                        : i < currentStep
                        ? 'bg-orange-500/50'
                        : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex gap-2">
                {!isFirst && (
                  <button
                    onClick={prevStep}
                    className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>
                )}
                <button
                  onClick={nextStep}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-1"
                >
                  {isLast ? 'Get Started' : 'Next'}
                  {!isLast && <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Keyboard hint */}
            <div className="px-6 py-2 bg-black/30 border-t border-white/5">
              <p className="text-xs text-white/30 text-center">
                Use ← → arrow keys to navigate • Press Esc to skip
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

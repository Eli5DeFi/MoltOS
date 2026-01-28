import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Terminal,
  Download,
  Settings,
  Zap,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';
import type { SetupWizardStep, MoltBotInstallStatus } from '@/types';
import { moltbotService } from '@/services/moltbot';

interface SetupWizardProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export function SetupWizard({ onComplete, onSkip }: SetupWizardProps) {
  const [step, setStep] = useState<SetupWizardStep>('welcome');
  const [installStatus, setInstallStatus] = useState<MoltBotInstallStatus>('checking');
  const [installMethod, setInstallMethod] = useState<'npm' | 'script' | 'manual'>('npm');
  const [installProgress, setInstallProgress] = useState(0);
  const [installMessage, setInstallMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copiedCommand, setCopiedCommand] = useState<number | null>(null);

  // Check installation on mount
  useEffect(() => {
    if (step === 'check_installation') {
      checkInstallation();
    }
  }, [step]);

  const checkInstallation = async () => {
    setInstallStatus('checking');
    try {
      const status = await moltbotService.checkInstallation();
      setInstallStatus(status.installStatus);

      if (status.installStatus === 'connected' || status.installStatus === 'configured') {
        // Already installed, skip to complete
        setTimeout(() => {
          setStep('complete');
        }, 1500);
      } else {
        // Not installed, move to install method selection
        setTimeout(() => {
          setStep('install_method');
        }, 1500);
      }
    } catch {
      setError('Failed to check installation status');
      setInstallStatus('error');
    }
  };

  const startInstallation = async () => {
    setStep('installing');
    setInstallProgress(0);
    setError(null);

    try {
      const success = await moltbotService.install(installMethod, (progress, message) => {
        setInstallProgress(progress);
        setInstallMessage(message);
      });

      if (success) {
        setTimeout(() => setStep('configure'), 500);
      } else {
        setError('Installation failed. Please try again.');
      }
    } catch {
      setError('Installation failed. Please try again.');
    }
  };

  const configureAndConnect = async () => {
    setStep('connect');
    try {
      await moltbotService.startGateway();
      await moltbotService.connect();
      setTimeout(() => setStep('complete'), 1500);
    } catch {
      setError('Failed to connect to MoltBot');
    }
  };

  const copyCommand = (index: number, command: string) => {
    navigator.clipboard.writeText(command);
    setCopiedCommand(index);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-2xl"
            >
              <span className="text-5xl">🦞</span>
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-3">Welcome to MoltOS</h1>
            <p className="text-white/60 mb-8 max-w-md mx-auto">
              Your personal AI-powered desktop environment. Let's set up MoltBot to unlock
              the full potential of your workspace.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setStep('check_installation')}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mx-auto"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </button>
              {onSkip && (
                <button
                  onClick={onSkip}
                  className="text-white/40 hover:text-white/60 text-sm transition-colors"
                >
                  Skip for now
                </button>
              )}
            </div>
          </motion.div>
        );

      case 'check_installation':
        return (
          <motion.div
            key="check"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/5 flex items-center justify-center">
              {installStatus === 'checking' && (
                <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
              )}
              {(installStatus === 'connected' || installStatus === 'configured') && (
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              )}
              {installStatus === 'not_installed' && (
                <XCircle className="w-10 h-10 text-orange-400" />
              )}
              {installStatus === 'error' && (
                <XCircle className="w-10 h-10 text-red-400" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {installStatus === 'checking' && 'Checking for MoltBot...'}
              {(installStatus === 'connected' || installStatus === 'configured') && 'MoltBot Found!'}
              {installStatus === 'not_installed' && 'MoltBot Not Found'}
              {installStatus === 'error' && 'Check Failed'}
            </h2>
            <p className="text-white/60">
              {installStatus === 'checking' && 'Looking for MoltBot installation on your system...'}
              {(installStatus === 'connected' || installStatus === 'configured') && 'Great! MoltBot is already installed. Setting up connection...'}
              {installStatus === 'not_installed' && "Let's get MoltBot installed to power up your experience."}
              {installStatus === 'error' && error}
            </p>
          </motion.div>
        );

      case 'install_method':
        return (
          <motion.div
            key="method"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h2 className="text-2xl font-bold text-white mb-2 text-center">Choose Installation Method</h2>
            <p className="text-white/60 mb-6 text-center">Select how you'd like to install MoltBot</p>

            <div className="space-y-3 mb-6">
              <InstallMethodCard
                icon={<Download className="w-6 h-6" />}
                title="NPM Install"
                description="Recommended for most users"
                tag="Recommended"
                selected={installMethod === 'npm'}
                onClick={() => setInstallMethod('npm')}
              />
              <InstallMethodCard
                icon={<Terminal className="w-6 h-6" />}
                title="Install Script"
                description="One-line installation script"
                selected={installMethod === 'script'}
                onClick={() => setInstallMethod('script')}
              />
              <InstallMethodCard
                icon={<Settings className="w-6 h-6" />}
                title="Manual Install"
                description="Build from source"
                selected={installMethod === 'manual'}
                onClick={() => setInstallMethod('manual')}
              />
            </div>

            {/* Show commands for selected method */}
            <div className="bg-black/30 rounded-xl p-4 mb-6">
              <p className="text-xs text-white/40 mb-2 uppercase tracking-wider">Commands</p>
              <div className="space-y-2">
                {moltbotService.getInstallCommands(installMethod).map((cmd, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <code className="flex-1 text-sm text-green-400 font-mono bg-black/30 px-3 py-2 rounded-lg">
                      $ {cmd}
                    </code>
                    <button
                      onClick={() => copyCommand(i, cmd)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      {copiedCommand === i ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-white/40" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('welcome')}
                className="flex-1 px-6 py-3 bg-white/5 text-white font-medium rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <button
                onClick={startInstallation}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                Install Now
                <Zap className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        );

      case 'installing':
        return (
          <motion.div
            key="installing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-600/20 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-orange-400 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Installing MoltBot</h2>
            <p className="text-white/60 mb-6">{installMessage || 'Please wait...'}</p>

            {/* Progress bar */}
            <div className="max-w-md mx-auto">
              <div className="flex justify-between text-sm text-white/40 mb-2">
                <span>Progress</span>
                <span>{installProgress}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-orange-500 to-red-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${installProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {error && (
              <p className="text-red-400 mt-4">{error}</p>
            )}
          </motion.div>
        );

      case 'configure':
        return (
          <motion.div
            key="configure"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Installation Complete!</h2>
            <p className="text-white/60 mb-6">MoltBot has been installed successfully. Ready to connect?</p>

            <div className="bg-white/5 rounded-xl p-4 mb-6 max-w-md mx-auto">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/70">Version</span>
                <span className="text-white font-mono">2025.1.28</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/70">Gateway Port</span>
                <span className="text-white font-mono">18789</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">Model</span>
                <span className="text-white font-mono text-sm">claude-opus-4-5</span>
              </div>
            </div>

            <button
              onClick={configureAndConnect}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mx-auto"
            >
              Connect to MoltBot
              <Zap className="w-5 h-5" />
            </button>
          </motion.div>
        );

      case 'connect':
        return (
          <motion.div
            key="connect"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-blue-500/20 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Connecting to Gateway</h2>
            <p className="text-white/60">Establishing connection to MoltBot Gateway...</p>
          </motion.div>
        );

      case 'complete':
        return (
          <motion.div
            key="complete"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-2xl"
            >
              <Sparkles className="w-12 h-12 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-3">You're All Set!</h2>
            <p className="text-white/60 mb-8 max-w-md mx-auto">
              MoltBot is now connected and ready to assist you. Enjoy your AI-powered
              desktop experience!
            </p>
            <button
              onClick={onComplete}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mx-auto"
            >
              Enter MoltOS
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }} />
      </div>

      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative w-full max-w-lg mx-4 p-8 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl">
        {/* Step indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {(['welcome', 'check_installation', 'install_method', 'installing', 'configure', 'complete'] as SetupWizardStep[]).map((s, i) => (
            <div
              key={s}
              className={`w-2 h-2 rounded-full transition-colors ${
                step === s
                  ? 'bg-orange-500'
                  : ['welcome', 'check_installation', 'install_method', 'installing', 'configure', 'complete'].indexOf(step) > i
                  ? 'bg-white/40'
                  : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>
    </div>
  );
}

interface InstallMethodCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  tag?: string;
  selected: boolean;
  onClick: () => void;
}

function InstallMethodCard({ icon, title, description, tag, selected, onClick }: InstallMethodCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-xl border transition-all text-left flex items-center gap-4 ${
        selected
          ? 'bg-orange-500/10 border-orange-500/50'
          : 'bg-white/5 border-white/10 hover:bg-white/10'
      }`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
        selected ? 'bg-orange-500/20 text-orange-400' : 'bg-white/5 text-white/50'
      }`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-white font-medium">{title}</span>
          {tag && (
            <span className="px-2 py-0.5 text-xs bg-orange-500/20 text-orange-400 rounded-full">
              {tag}
            </span>
          )}
        </div>
        <p className="text-sm text-white/50">{description}</p>
      </div>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
        selected ? 'border-orange-500 bg-orange-500' : 'border-white/30'
      }`}>
        {selected && <Check className="w-3 h-3 text-white" />}
      </div>
    </button>
  );
}

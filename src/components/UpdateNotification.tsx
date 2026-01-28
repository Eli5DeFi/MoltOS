import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, ExternalLink, Check, Copy, RefreshCw } from 'lucide-react';
import { updaterService, type UpdateInfo } from '@/services/updater';

interface UpdateNotificationProps {
  update: UpdateInfo;
  onDismiss: () => void;
}

export function UpdateNotification({ update, onDismiss }: UpdateNotificationProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const updateCommand = updaterService.getUpdateCommand();

  const copyCommand = () => {
    navigator.clipboard.writeText(updateCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    await updaterService.performUpdate();
    setIsUpdating(false);
    onDismiss();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className="fixed top-10 right-4 z-[9998] w-80"
    >
      <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl rounded-xl border border-green-500/30 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-green-500/10 border-b border-green-500/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Download className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Update Available</p>
              <p className="text-xs text-white/50">v{update.latestVersion}</p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/50 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-sm text-white/70 mb-3">
            MoltBot {update.latestVersion} is available. You're on {update.currentVersion}.
          </p>

          {/* Expandable release notes */}
          {update.releaseNotes && (
            <div className="mb-3">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                {isExpanded ? 'Hide' : 'Show'} release notes
              </button>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 p-3 rounded-lg bg-black/30 max-h-40 overflow-y-auto">
                      <pre className="text-xs text-white/60 whitespace-pre-wrap font-sans">
                        {update.releaseNotes}
                      </pre>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Update command */}
          <div className="flex items-center gap-2 p-2 rounded-lg bg-black/30 mb-3">
            <code className="flex-1 text-xs text-green-400 font-mono truncate">
              $ {updateCommand}
            </code>
            <button
              onClick={copyCommand}
              className="p-1.5 rounded hover:bg-white/10 transition-colors"
              title="Copy command"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-white/50" />
              )}
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="flex-1 px-3 py-2 rounded-lg bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Update Now
                </>
              )}
            </button>
            <a
              href={update.releaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors flex items-center gap-1"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Auto-update checker component
export function AutoUpdateChecker() {
  const [update, setUpdate] = useState<UpdateInfo | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Start periodic checks
    updaterService.startPeriodicChecks();

    // Subscribe to updates
    const unsubscribe = updaterService.subscribe((state) => {
      if (state.updateAvailable && !dismissed) {
        setUpdate(state.updateAvailable);
      }
    });

    return () => {
      unsubscribe();
      updaterService.stopPeriodicChecks();
    };
  }, [dismissed]);

  const handleDismiss = () => {
    setDismissed(true);
    setUpdate(null);
    // Reset dismissed after 30 minutes to show again
    setTimeout(() => setDismissed(false), 30 * 60 * 1000);
  };

  return (
    <AnimatePresence>
      {update && !dismissed && (
        <UpdateNotification update={update} onDismiss={handleDismiss} />
      )}
    </AnimatePresence>
  );
}

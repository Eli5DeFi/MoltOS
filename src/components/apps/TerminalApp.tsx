import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDesktopStore } from '@/store';
import { HelpCircle, Lightbulb } from 'lucide-react';

interface CommandInfo {
  name: string;
  description: string;
  usage: string;
  examples?: string[];
}

const COMMANDS: CommandInfo[] = [
  { name: 'help', description: 'Show all available commands', usage: 'help', examples: ['help'] },
  { name: 'clear', description: 'Clear the terminal screen', usage: 'clear', examples: ['clear'] },
  { name: 'status', description: 'Display system status and metrics', usage: 'status', examples: ['status'] },
  { name: 'skills', description: 'List all installed MoltBot skills', usage: 'skills', examples: ['skills'] },
  { name: 'agents', description: 'List all available agents and their status', usage: 'agents', examples: ['agents'] },
  { name: 'whoami', description: 'Display current user information', usage: 'whoami', examples: ['whoami'] },
  { name: 'date', description: 'Show current date and time', usage: 'date', examples: ['date'] },
  { name: 'cowsay', description: 'Fun ASCII art cow with a message', usage: 'cowsay [message]', examples: ['cowsay', 'cowsay Hello MoltOS!'] },
  { name: 'matrix', description: 'Enter the matrix (fun animation)', usage: 'matrix', examples: ['matrix'] },
  { name: 'fortune', description: 'Get a random fortune', usage: 'fortune', examples: ['fortune'] },
  { name: 'exec', description: 'Execute a shell command via MoltBot', usage: 'exec <command> [options]', examples: ['exec ls -la', 'exec --background npm run build'] },
  { name: 'update', description: 'Check for MoltBot updates', usage: 'update [--check|--install]', examples: ['update --check', 'update --install'] },
  { name: 'moltbot', description: 'Run MoltBot CLI commands', usage: 'moltbot <subcommand>', examples: ['moltbot status', 'moltbot doctor'] },
];

export function TerminalApp() {
  const { terminalOutput, terminalHistory, executeCommand, clearTerminal } = useDesktopStore();
  const [input, setInput] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showTooltip, setShowTooltip] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    outputRef.current?.scrollTo(0, outputRef.current.scrollHeight);
  }, [terminalOutput]);

  // Get matching commands for autocomplete
  const getMatchingCommands = () => {
    if (!input.trim()) return [];
    const inputLower = input.toLowerCase().split(' ')[0];
    return COMMANDS.filter(cmd => cmd.name.startsWith(inputLower));
  };

  const matchingCommands = getMatchingCommands();
  const currentCommand = COMMANDS.find(cmd => cmd.name === input.split(' ')[0].toLowerCase());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    executeCommand(input);
    setInput('');
    setHistoryIndex(-1);
    setShowTooltip(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (showTooltip && matchingCommands.length > 0) {
        setSelectedSuggestion(prev => Math.max(0, prev - 1));
      } else if (historyIndex < terminalHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(terminalHistory[terminalHistory.length - 1 - newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (showTooltip && matchingCommands.length > 0) {
        setSelectedSuggestion(prev => Math.min(matchingCommands.length - 1, prev + 1));
      } else if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(terminalHistory[terminalHistory.length - 1 - newIndex] || '');
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (matchingCommands.length > 0) {
        setInput(matchingCommands[selectedSuggestion].name + ' ');
        setShowTooltip(false);
      }
    } else if (e.ctrlKey && e.key === 'l') {
      e.preventDefault();
      clearTerminal();
    } else if (e.key === 'Escape') {
      setShowTooltip(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setShowTooltip(e.target.value.length > 0);
    setSelectedSuggestion(0);
  };

  const focusInput = () => inputRef.current?.focus();

  const selectSuggestion = (cmd: CommandInfo) => {
    setInput(cmd.name + ' ');
    setShowTooltip(false);
    inputRef.current?.focus();
  };

  return (
    <div
      className="flex flex-col h-full bg-[#1a1a1a] font-mono text-sm"
      onClick={focusInput}
    >
      {/* Terminal Header */}
      <div className="flex items-center gap-2 px-4 py-2 bg-black/30 border-b border-white/5">
        <span className="text-white/70">moltbot@moltos</span>
        <span className="text-white/30">~</span>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); setShowHelp(!showHelp); }}
            className={`p-1 rounded hover:bg-white/10 transition-colors ${showHelp ? 'bg-white/10' : ''}`}
            title="Show command help"
          >
            <HelpCircle className="w-4 h-4 text-white/50" />
          </button>
          <span className="text-green-400 text-xs">zsh</span>
        </div>
      </div>

      {/* Help Panel */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-white/5"
          >
            <div className="p-4 bg-blue-500/5 max-h-48 overflow-y-auto">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-semibold text-white">Quick Reference</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {COMMANDS.slice(0, 8).map(cmd => (
                  <button
                    key={cmd.name}
                    onClick={() => { setInput(cmd.name); setShowHelp(false); }}
                    className="text-left p-2 rounded-lg hover:bg-white/5 transition-colors group"
                  >
                    <span className="text-green-400 text-xs">{cmd.name}</span>
                    <p className="text-white/40 text-xs truncate group-hover:text-white/60">{cmd.description}</p>
                  </button>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-xs text-white/30">
                  <span className="text-white/50">exec</span> - Run shell commands via MoltBot Gateway
                  {' | '}
                  <span className="text-white/50">moltbot</span> - Access MoltBot CLI
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Output */}
      <div
        ref={outputRef}
        className="flex-1 overflow-y-auto p-4 space-y-1"
      >
        {terminalOutput.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.1 }}
            className="text-white/90 whitespace-pre-wrap"
          >
            {line.startsWith('moltbot@moltos') ? (
              <>
                <span className="text-green-400">moltbot</span>
                <span className="text-white/50">@</span>
                <span className="text-blue-400">moltos</span>
                <span className="text-white/50"> ~ % </span>
                <span className="text-white">{line.split(' % ')[1]}</span>
              </>
            ) : line.startsWith('  ') ? (
              <span className="text-white/70">{line}</span>
            ) : line.includes('●') ? (
              <span className={line.includes('[●]') ? 'text-green-400' : line.includes('[○]') ? 'text-yellow-400' : 'text-red-400'}>
                {line}
              </span>
            ) : line.startsWith('Error:') || line.startsWith('error:') ? (
              <span className="text-red-400">{line}</span>
            ) : line.startsWith('Success:') || line.startsWith('✓') ? (
              <span className="text-green-400">{line}</span>
            ) : line.startsWith('Warning:') || line.startsWith('⚠') ? (
              <span className="text-yellow-400">{line}</span>
            ) : (
              line
            )}
          </motion.div>
        ))}
      </div>

      {/* Autocomplete Tooltip */}
      <AnimatePresence>
        {showTooltip && matchingCommands.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mx-4 mb-2 bg-gray-800/95 backdrop-blur-sm rounded-lg border border-white/10 shadow-xl overflow-hidden"
          >
            <div className="max-h-48 overflow-y-auto">
              {matchingCommands.map((cmd, i) => (
                <button
                  key={cmd.name}
                  onClick={() => selectSuggestion(cmd)}
                  className={`w-full text-left px-3 py-2 flex items-start gap-3 transition-colors ${
                    i === selectedSuggestion ? 'bg-blue-500/20' : 'hover:bg-white/5'
                  }`}
                >
                  <span className="text-green-400 font-medium min-w-[80px]">{cmd.name}</span>
                  <div className="flex-1">
                    <p className="text-white/70 text-xs">{cmd.description}</p>
                    <p className="text-white/30 text-xs mt-0.5">Usage: {cmd.usage}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="px-3 py-1.5 bg-black/30 border-t border-white/5">
              <p className="text-xs text-white/30">↑↓ Navigate • Tab Complete • Enter Execute</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Command Info Tooltip */}
      <AnimatePresence>
        {currentCommand && input.includes(' ') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-4 mb-2 px-3 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-yellow-200">
                <span className="font-semibold">{currentCommand.name}</span>: {currentCommand.usage}
              </span>
            </div>
            {currentCommand.examples && currentCommand.examples.length > 1 && (
              <p className="text-xs text-yellow-200/50 mt-1 ml-6">
                Examples: {currentCommand.examples.join(', ')}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex items-center px-4 py-3 border-t border-white/5">
        <span className="text-green-400">moltbot</span>
        <span className="text-white/50">@</span>
        <span className="text-blue-400">moltos</span>
        <span className="text-white/50"> ~ % </span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowTooltip(input.length > 0)}
          className="flex-1 bg-transparent text-white outline-none ml-1"
          autoFocus
          placeholder="Type a command..."
        />
        <span className="w-2 h-5 bg-white/70 animate-pulse" />
      </form>

      {/* Quick Tips */}
      <div className="px-4 py-2 bg-black/20 border-t border-white/5">
        <p className="text-xs text-white/30">
          💡 Try: <span className="text-green-400/60">exec</span> ls -la | <span className="text-green-400/60">moltbot</span> doctor | <span className="text-green-400/60">update</span> --check | Ctrl+L clear | ? help
        </p>
      </div>
    </div>
  );
}

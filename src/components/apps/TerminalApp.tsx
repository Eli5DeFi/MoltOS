import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDesktopStore } from '@/store';
import { HelpCircle, Lightbulb, Palette, Bot, Send, ChevronDown, Sparkles } from 'lucide-react';

interface CommandInfo {
  name: string;
  description: string;
  usage: string;
  examples?: string[];
}

// Terminal Themes
interface TerminalTheme {
  id: string;
  name: string;
  bg: string;
  headerBg: string;
  text: string;
  textMuted: string;
  prompt: string;
  promptUser: string;
  promptHost: string;
  accent: string;
  selection: string;
  cursor: string;
  border: string;
}

const TERMINAL_THEMES: TerminalTheme[] = [
  {
    id: 'default',
    name: 'MoltOS Dark',
    bg: '#1a1a1a',
    headerBg: 'rgba(0,0,0,0.3)',
    text: 'rgba(255,255,255,0.9)',
    textMuted: 'rgba(255,255,255,0.5)',
    prompt: 'rgba(255,255,255,0.5)',
    promptUser: '#34d399',
    promptHost: '#60a5fa',
    accent: '#3b82f6',
    selection: 'rgba(59,130,246,0.3)',
    cursor: 'rgba(255,255,255,0.7)',
    border: 'rgba(255,255,255,0.05)',
  },
  {
    id: 'matrix',
    name: 'Matrix',
    bg: '#0d0d0d',
    headerBg: '#0a0a0a',
    text: '#00ff41',
    textMuted: '#00aa2a',
    prompt: '#006620',
    promptUser: '#00ff41',
    promptHost: '#00cc33',
    accent: '#00ff41',
    selection: 'rgba(0,255,65,0.2)',
    cursor: '#00ff41',
    border: '#003311',
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    bg: '#1e3a5f',
    headerBg: '#152d4a',
    text: '#e0f4ff',
    textMuted: '#7eb8da',
    prompt: '#5a9fd4',
    promptUser: '#64d2ff',
    promptHost: '#5ac8fa',
    accent: '#007aff',
    selection: 'rgba(0,122,255,0.3)',
    cursor: '#64d2ff',
    border: 'rgba(100,210,255,0.1)',
  },
  {
    id: 'dracula',
    name: 'Dracula',
    bg: '#282a36',
    headerBg: '#21222c',
    text: '#f8f8f2',
    textMuted: '#6272a4',
    prompt: '#6272a4',
    promptUser: '#50fa7b',
    promptHost: '#bd93f9',
    accent: '#ff79c6',
    selection: 'rgba(189,147,249,0.3)',
    cursor: '#f8f8f2',
    border: '#44475a',
  },
  {
    id: 'solarized',
    name: 'Solarized Dark',
    bg: '#002b36',
    headerBg: '#001f27',
    text: '#839496',
    textMuted: '#586e75',
    prompt: '#657b83',
    promptUser: '#859900',
    promptHost: '#268bd2',
    accent: '#2aa198',
    selection: 'rgba(38,139,210,0.3)',
    cursor: '#839496',
    border: '#073642',
  },
  {
    id: 'nord',
    name: 'Nord',
    bg: '#2e3440',
    headerBg: '#242933',
    text: '#d8dee9',
    textMuted: '#4c566a',
    prompt: '#4c566a',
    promptUser: '#a3be8c',
    promptHost: '#81a1c1',
    accent: '#88c0d0',
    selection: 'rgba(136,192,208,0.2)',
    cursor: '#d8dee9',
    border: '#3b4252',
  },
  {
    id: 'light',
    name: 'Light',
    bg: '#fafafa',
    headerBg: '#f0f0f0',
    text: '#1a1a1a',
    textMuted: '#666666',
    prompt: '#888888',
    promptUser: '#16a34a',
    promptHost: '#2563eb',
    accent: '#2563eb',
    selection: 'rgba(37,99,235,0.15)',
    cursor: '#1a1a1a',
    border: '#e0e0e0',
  },
  {
    id: 'synthwave',
    name: 'Synthwave',
    bg: '#1a1025',
    headerBg: '#120a1a',
    text: '#ff7edb',
    textMuted: '#9d4edd',
    prompt: '#7b2cbf',
    promptUser: '#00ffff',
    promptHost: '#ff00ff',
    accent: '#fe53bb',
    selection: 'rgba(254,83,187,0.3)',
    cursor: '#00ffff',
    border: '#3c096c',
  },
];

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
  { name: 'ask', description: 'Ask MoltBot a question directly', usage: 'ask <question>', examples: ['ask how do I list files?', 'ask what is my IP?'] },
  { name: 'theme', description: 'Change terminal theme', usage: 'theme [name]', examples: ['theme', 'theme matrix', 'theme ocean'] },
];

export function TerminalApp() {
  const { terminalOutput, terminalHistory, executeCommand, clearTerminal } = useDesktopStore();
  const [input, setInput] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showTooltip, setShowTooltip] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<TerminalTheme>(TERMINAL_THEMES[0]);
  const [moltbotMode, setMoltbotMode] = useState(false);
  const [moltbotThinking, setMoltbotThinking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // Load saved theme
  useEffect(() => {
    const savedThemeId = localStorage.getItem('moltos_terminal_theme');
    if (savedThemeId) {
      const theme = TERMINAL_THEMES.find(t => t.id === savedThemeId);
      if (theme) setCurrentTheme(theme);
    }
  }, []);

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

  const changeTheme = (theme: TerminalTheme) => {
    setCurrentTheme(theme);
    localStorage.setItem('moltos_terminal_theme', theme.id);
    setShowThemePicker(false);
  };

  const handleMoltbotAsk = async (question: string) => {
    setMoltbotThinking(true);

    // Simulate MoltBot response
    setTimeout(() => {
      const responses: Record<string, string> = {
        'files': '📁 To list files, use: `ls` or `ls -la` for detailed view.\n   In MoltOS, you can also open the Files app from the dock!',
        'help': '🤖 I can help with:\n   • Terminal commands (try "help")\n   • System status (try "status")\n   • Running shell commands (try "exec <cmd>")\n   • Skills management (try "skills")',
        'ip': '🌐 To find your IP address:\n   • Local: `exec hostname -I`\n   • Public: `exec curl -s ifconfig.me`',
        'default': `🤖 Great question! Here's what I know:\n\n   ${question}\n\n   Try these related commands:\n   • help - See all commands\n   • exec - Run shell commands\n   • moltbot doctor - Check system health`,
      };

      let response = responses['default'];
      const q = question.toLowerCase();
      if (q.includes('file') || q.includes('list') || q.includes('ls')) {
        response = responses['files'];
      } else if (q.includes('help') || q.includes('what can')) {
        response = responses['help'];
      } else if (q.includes('ip') || q.includes('address')) {
        response = responses['ip'];
      }

      useDesktopStore.getState().executeCommand(`ask ${question}`);
      // Add MoltBot response after the command
      const store = useDesktopStore.getState();
      useDesktopStore.setState({
        terminalOutput: [...store.terminalOutput, '', '🤖 MoltBot:', ...response.split('\n'), ''],
      });

      setMoltbotThinking(false);
    }, 800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const cmd = input.trim().toLowerCase();

    // Handle theme command
    if (cmd === 'theme' || cmd.startsWith('theme ')) {
      const themeName = input.trim().split(' ')[1]?.toLowerCase();
      if (!themeName) {
        // Show available themes
        useDesktopStore.setState(state => ({
          terminalOutput: [...state.terminalOutput, `moltbot@moltos ~ % ${input}`,
            'Available themes:',
            ...TERMINAL_THEMES.map(t => `  ${t.id === currentTheme.id ? '●' : '○'} ${t.name} (${t.id})`),
            '',
            'Usage: theme <name>',
            'Example: theme matrix',
            '',
          ],
          terminalHistory: [...state.terminalHistory, input],
        }));
      } else {
        const theme = TERMINAL_THEMES.find(t => t.id === themeName || t.name.toLowerCase() === themeName);
        if (theme) {
          changeTheme(theme);
          useDesktopStore.setState(state => ({
            terminalOutput: [...state.terminalOutput, `moltbot@moltos ~ % ${input}`,
              `✓ Theme changed to ${theme.name}`,
              '',
            ],
            terminalHistory: [...state.terminalHistory, input],
          }));
        } else {
          useDesktopStore.setState(state => ({
            terminalOutput: [...state.terminalOutput, `moltbot@moltos ~ % ${input}`,
              `Error: Theme "${themeName}" not found`,
              'Run "theme" to see available themes',
              '',
            ],
            terminalHistory: [...state.terminalHistory, input],
          }));
        }
      }
      setInput('');
      return;
    }

    // Handle ask command
    if (cmd.startsWith('ask ')) {
      const question = input.trim().slice(4);
      if (question) {
        handleMoltbotAsk(question);
      }
      setInput('');
      return;
    }

    // MoltBot mode - treat input as question
    if (moltbotMode) {
      handleMoltbotAsk(input);
      setInput('');
      return;
    }

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
      setMoltbotMode(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setShowTooltip(e.target.value.length > 0 && !moltbotMode);
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
      className="flex flex-col h-full font-mono text-sm transition-colors duration-300"
      style={{ backgroundColor: currentTheme.bg, color: currentTheme.text }}
      onClick={focusInput}
    >
      {/* Terminal Header */}
      <div
        className="flex items-center gap-2 px-4 py-2 border-b"
        style={{ backgroundColor: currentTheme.headerBg, borderColor: currentTheme.border }}
      >
        <span style={{ color: currentTheme.textMuted }}>moltbot@moltos</span>
        <span style={{ color: currentTheme.prompt }}>~</span>
        <div className="ml-auto flex items-center gap-2">
          {/* MoltBot Mode Toggle */}
          <button
            onClick={(e) => { e.stopPropagation(); setMoltbotMode(!moltbotMode); }}
            className={`p-1.5 rounded transition-colors flex items-center gap-1.5`}
            style={{
              backgroundColor: moltbotMode ? currentTheme.accent + '30' : 'transparent',
              color: moltbotMode ? currentTheme.accent : currentTheme.textMuted,
            }}
            title="Toggle MoltBot Assistant Mode"
          >
            <Bot className="w-4 h-4" />
            {moltbotMode && <span className="text-xs">AI Mode</span>}
          </button>

          {/* Theme Picker */}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowThemePicker(!showThemePicker); }}
              className="p-1.5 rounded hover:opacity-80 transition-opacity flex items-center gap-1"
              style={{ color: currentTheme.textMuted }}
              title="Change theme"
            >
              <Palette className="w-4 h-4" />
              <ChevronDown className="w-3 h-3" />
            </button>

            <AnimatePresence>
              {showThemePicker && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-48 rounded-lg shadow-xl overflow-hidden z-50"
                  style={{ backgroundColor: currentTheme.bg, border: `1px solid ${currentTheme.border}` }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-2">
                    <p className="text-xs font-semibold mb-2 px-2" style={{ color: currentTheme.textMuted }}>
                      Select Theme
                    </p>
                    {TERMINAL_THEMES.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => changeTheme(theme)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded transition-colors"
                        style={{
                          backgroundColor: theme.id === currentTheme.id ? currentTheme.selection : 'transparent',
                        }}
                      >
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{
                            backgroundColor: theme.bg,
                            borderColor: theme.accent,
                          }}
                        />
                        <span
                          className="text-xs"
                          style={{ color: theme.id === currentTheme.id ? currentTheme.accent : currentTheme.text }}
                        >
                          {theme.name}
                        </span>
                        {theme.id === currentTheme.id && (
                          <span className="ml-auto text-xs" style={{ color: currentTheme.accent }}>✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Help Button */}
          <button
            onClick={(e) => { e.stopPropagation(); setShowHelp(!showHelp); }}
            className={`p-1.5 rounded transition-opacity`}
            style={{
              backgroundColor: showHelp ? currentTheme.accent + '20' : 'transparent',
              color: currentTheme.textMuted,
            }}
            title="Show command help"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <span className="text-xs" style={{ color: currentTheme.accent }}>zsh</span>
        </div>
      </div>

      {/* MoltBot Mode Banner */}
      <AnimatePresence>
        {moltbotMode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b"
            style={{ borderColor: currentTheme.border }}
          >
            <div
              className="px-4 py-2 flex items-center gap-2"
              style={{ backgroundColor: currentTheme.accent + '15' }}
            >
              <Sparkles className="w-4 h-4" style={{ color: currentTheme.accent }} />
              <span className="text-sm" style={{ color: currentTheme.accent }}>
                MoltBot Assistant Mode
              </span>
              <span className="text-xs" style={{ color: currentTheme.textMuted }}>
                — Ask questions naturally, I'll help you!
              </span>
              <button
                onClick={() => setMoltbotMode(false)}
                className="ml-auto text-xs px-2 py-0.5 rounded"
                style={{ color: currentTheme.textMuted }}
              >
                Press ESC to exit
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Panel */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b"
            style={{ borderColor: currentTheme.border }}
          >
            <div className="p-4 max-h-48 overflow-y-auto" style={{ backgroundColor: currentTheme.accent + '08' }}>
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4" style={{ color: '#fbbf24' }} />
                <span className="text-sm font-semibold">Quick Reference</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {COMMANDS.slice(0, 10).map(cmd => (
                  <button
                    key={cmd.name}
                    onClick={() => { setInput(cmd.name); setShowHelp(false); }}
                    className="text-left p-2 rounded-lg transition-colors group"
                    style={{ backgroundColor: 'transparent' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = currentTheme.selection}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <span className="text-xs" style={{ color: currentTheme.accent }}>{cmd.name}</span>
                    <p className="text-xs truncate" style={{ color: currentTheme.textMuted }}>{cmd.description}</p>
                  </button>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t" style={{ borderColor: currentTheme.border }}>
                <p className="text-xs" style={{ color: currentTheme.textMuted }}>
                  <span style={{ color: currentTheme.text }}>ask</span> - Chat with MoltBot AI
                  {' | '}
                  <span style={{ color: currentTheme.text }}>theme</span> - Change terminal colors
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
            className="whitespace-pre-wrap"
          >
            {line.startsWith('moltbot@moltos') ? (
              <>
                <span style={{ color: currentTheme.promptUser }}>moltbot</span>
                <span style={{ color: currentTheme.prompt }}>@</span>
                <span style={{ color: currentTheme.promptHost }}>moltos</span>
                <span style={{ color: currentTheme.prompt }}> ~ % </span>
                <span>{line.split(' % ')[1]}</span>
              </>
            ) : line.startsWith('  ') ? (
              <span style={{ color: currentTheme.textMuted }}>{line}</span>
            ) : line.includes('●') || line.includes('[●]') ? (
              <span style={{ color: currentTheme.accent }}>{line}</span>
            ) : line.includes('○') || line.includes('[○]') ? (
              <span style={{ color: '#fbbf24' }}>{line}</span>
            ) : line.startsWith('Error:') || line.startsWith('error:') ? (
              <span style={{ color: '#ef4444' }}>{line}</span>
            ) : line.startsWith('Success:') || line.startsWith('✓') ? (
              <span style={{ color: '#22c55e' }}>{line}</span>
            ) : line.startsWith('Warning:') || line.startsWith('⚠') ? (
              <span style={{ color: '#fbbf24' }}>{line}</span>
            ) : line.startsWith('🤖') ? (
              <span style={{ color: currentTheme.accent }}>{line}</span>
            ) : (
              line
            )}
          </motion.div>
        ))}

        {/* MoltBot Thinking Indicator */}
        {moltbotThinking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <Bot className="w-4 h-4 animate-pulse" style={{ color: currentTheme.accent }} />
            <span className="text-sm" style={{ color: currentTheme.textMuted }}>
              MoltBot is thinking...
            </span>
            <motion.span
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              ●●●
            </motion.span>
          </motion.div>
        )}
      </div>

      {/* Autocomplete Tooltip */}
      <AnimatePresence>
        {showTooltip && matchingCommands.length > 0 && !moltbotMode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mx-4 mb-2 rounded-lg shadow-xl overflow-hidden"
            style={{ backgroundColor: currentTheme.headerBg, border: `1px solid ${currentTheme.border}` }}
          >
            <div className="max-h-48 overflow-y-auto">
              {matchingCommands.map((cmd, i) => (
                <button
                  key={cmd.name}
                  onClick={() => selectSuggestion(cmd)}
                  className="w-full text-left px-3 py-2 flex items-start gap-3 transition-colors"
                  style={{
                    backgroundColor: i === selectedSuggestion ? currentTheme.selection : 'transparent',
                  }}
                >
                  <span className="font-medium min-w-[80px]" style={{ color: currentTheme.accent }}>{cmd.name}</span>
                  <div className="flex-1">
                    <p className="text-xs" style={{ color: currentTheme.textMuted }}>{cmd.description}</p>
                    <p className="text-xs mt-0.5" style={{ color: currentTheme.prompt }}>Usage: {cmd.usage}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="px-3 py-1.5 border-t" style={{ backgroundColor: currentTheme.bg, borderColor: currentTheme.border }}>
              <p className="text-xs" style={{ color: currentTheme.prompt }}>↑↓ Navigate • Tab Complete • Enter Execute</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Command Info Tooltip */}
      <AnimatePresence>
        {currentCommand && input.includes(' ') && !moltbotMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-4 mb-2 px-3 py-2 rounded-lg"
            style={{ backgroundColor: '#fbbf2415', border: '1px solid #fbbf2430' }}
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" style={{ color: '#fbbf24' }} />
              <span className="text-xs" style={{ color: '#fcd34d' }}>
                <span className="font-semibold">{currentCommand.name}</span>: {currentCommand.usage}
              </span>
            </div>
            {currentCommand.examples && currentCommand.examples.length > 1 && (
              <p className="text-xs mt-1 ml-6" style={{ color: '#fbbf2480' }}>
                Examples: {currentCommand.examples.join(', ')}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex items-center px-4 py-3 border-t" style={{ borderColor: currentTheme.border }}>
        {moltbotMode ? (
          <>
            <Bot className="w-4 h-4 mr-2" style={{ color: currentTheme.accent }} />
            <span className="text-sm mr-2" style={{ color: currentTheme.accent }}>Ask:</span>
          </>
        ) : (
          <>
            <span style={{ color: currentTheme.promptUser }}>moltbot</span>
            <span style={{ color: currentTheme.prompt }}>@</span>
            <span style={{ color: currentTheme.promptHost }}>moltos</span>
            <span style={{ color: currentTheme.prompt }}> ~ % </span>
          </>
        )}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowTooltip(input.length > 0 && !moltbotMode)}
          className="flex-1 bg-transparent outline-none ml-1"
          style={{ color: currentTheme.text }}
          autoFocus
          placeholder={moltbotMode ? "Ask MoltBot anything..." : "Type a command..."}
        />
        {moltbotMode ? (
          <button
            type="submit"
            className="p-1.5 rounded transition-colors"
            style={{ backgroundColor: currentTheme.accent + '20', color: currentTheme.accent }}
          >
            <Send className="w-4 h-4" />
          </button>
        ) : (
          <span className="w-2 h-5 animate-pulse" style={{ backgroundColor: currentTheme.cursor }} />
        )}
      </form>

      {/* Quick Tips */}
      <div className="px-4 py-2 border-t" style={{ backgroundColor: currentTheme.headerBg, borderColor: currentTheme.border }}>
        <p className="text-xs" style={{ color: currentTheme.prompt }}>
          💡 Try: <span style={{ color: currentTheme.accent }}>ask</span> how do I...? |{' '}
          <span style={{ color: currentTheme.accent }}>theme</span> matrix |{' '}
          <span style={{ color: currentTheme.accent }}>exec</span> ls | Ctrl+L clear
        </p>
      </div>
    </div>
  );
}

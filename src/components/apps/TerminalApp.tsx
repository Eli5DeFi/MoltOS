import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDesktopStore } from '@/store';

export function TerminalApp() {
  const { terminalOutput, terminalHistory, executeCommand, clearTerminal } = useDesktopStore();
  const [input, setInput] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    outputRef.current?.scrollTo(0, outputRef.current.scrollHeight);
  }, [terminalOutput]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    executeCommand(input);
    setInput('');
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < terminalHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(terminalHistory[terminalHistory.length - 1 - newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(terminalHistory[terminalHistory.length - 1 - newIndex] || '');
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const commands = ['help', 'clear', 'status', 'skills', 'agents', 'whoami', 'date', 'cowsay', 'matrix', 'fortune'];
      const match = commands.find(cmd => cmd.startsWith(input.toLowerCase()));
      if (match) setInput(match);
    } else if (e.ctrlKey && e.key === 'l') {
      e.preventDefault();
      clearTerminal();
    }
  };

  const focusInput = () => inputRef.current?.focus();

  return (
    <div
      className="flex flex-col h-full bg-[#1a1a1a] font-mono text-sm"
      onClick={focusInput}
    >
      {/* Terminal Header */}
      <div className="flex items-center gap-2 px-4 py-2 bg-black/30 border-b border-white/5">
        <span className="text-white/70">moltbot@moltos</span>
        <span className="text-white/30">~</span>
        <span className="text-green-400 text-xs ml-auto">zsh</span>
      </div>

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
            ) : (
              line
            )}
          </motion.div>
        ))}
      </div>

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
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-white outline-none ml-1"
          autoFocus
        />
        <span className="w-2 h-5 bg-white/70 animate-pulse" />
      </form>

      {/* Fun hint */}
      <div className="px-4 py-2 bg-black/20 border-t border-white/5">
        <p className="text-xs text-white/30">
          Try: help, cowsay, matrix, fortune | Use Ctrl+L to clear | Arrow keys for history
        </p>
      </div>
    </div>
  );
}

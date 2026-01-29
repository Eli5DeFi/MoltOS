import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useDesktop } from '../../contexts/DesktopContext'
import { useApp } from '../../contexts/AppContext'
import { useTheme } from '../../contexts/ThemeContext'
import Fuse from 'fuse.js'

interface SearchResult {
  id: string
  title: string
  subtitle: string
  icon: string
  type: 'app' | 'file' | 'contact' | 'web' | 'calculation' | 'definition'
  action: () => void
}

const SpotlightSearch: React.FC = () => {
  const { closeSpotlight } = useDesktop()
  const { availableApps, launchApp } = useApp()
  const { currentTheme } = useTheme()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Create search index
  const searchItems = React.useMemo(() => {
    const items: any[] = []
    
    // Add apps
    availableApps.forEach(app => {
      items.push({
        id: `app-${app.id}`,
        title: app.displayName,
        subtitle: app.description,
        icon: app.icon,
        type: 'app',
        keywords: [app.name, app.displayName, app.category],
        action: () => {
          launchApp(app.id)
          closeSpotlight()
        }
      })
    })
    
    // Add system actions
    items.push(
      {
        id: 'system-settings',
        title: 'System Preferences',
        subtitle: 'Configure system settings',
        icon: '⚙️',
        type: 'app',
        keywords: ['settings', 'preferences', 'config'],
        action: () => {
          launchApp('settings')
          closeSpotlight()
        }
      },
      {
        id: 'system-logout',
        title: 'Log Out',
        subtitle: 'Log out of your account',
        icon: '🚪',
        type: 'system',
        keywords: ['logout', 'exit', 'quit'],
        action: () => {
          // Handle logout
          closeSpotlight()
        }
      }
    )
    
    return items
  }, [availableApps, launchApp, closeSpotlight])

  const fuse = new Fuse(searchItems, {
    keys: ['title', 'subtitle', 'keywords'],
    threshold: 0.3,
    includeScore: true
  })

  const performSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    // Handle calculations
    const mathExpression = searchQuery.replace(/[^0-9+\-*/().]/g, '')
    if (mathExpression && /[\d+\-*/()]/.test(searchQuery)) {
      try {
        const result = Function(`"use strict"; return (${mathExpression})`)()
        if (typeof result === 'number' && isFinite(result)) {
          setResults([{
            id: 'calculation',
            title: result.toString(),
            subtitle: `= ${searchQuery}`,
            icon: '🧮',
            type: 'calculation',
            action: () => {
              navigator.clipboard?.writeText(result.toString())
              closeSpotlight()
            }
          }])
          setSelectedIndex(0)
          return
        }
      } catch {
        // Not a valid calculation
      }
    }

    // Search through items
    const fuseResults = fuse.search(searchQuery)
    const searchResults: SearchResult[] = fuseResults.slice(0, 8).map(result => ({
      id: result.item.id,
      title: result.item.title,
      subtitle: result.item.subtitle,
      icon: result.item.icon,
      type: result.item.type,
      action: result.item.action
    }))

    // Add web search if no perfect matches
    if (searchQuery.length > 2) {
      searchResults.push({
        id: 'web-search',
        title: `Search for "${searchQuery}"`,
        subtitle: 'Search the web',
        icon: '🌐',
        type: 'web',
        action: () => {
          window.moltOS?.system.openExternal(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`)
          closeSpotlight()
        }
      })
    }

    setResults(searchResults)
    setSelectedIndex(0)
  }, [fuse, closeSpotlight])

  // Handle input changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(query)
    }, 150) // Debounce search

    return () => clearTimeout(timeoutId)
  }, [query, performSearch])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Escape':
        event.preventDefault()
        closeSpotlight()
        break
      case 'ArrowDown':
        event.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
        break
      case 'ArrowUp':
        event.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
        break
      case 'Enter':
        event.preventDefault()
        if (results[selectedIndex]) {
          results[selectedIndex].action()
        }
        break
    }
  }, [results, selectedIndex, closeSpotlight])

  // Auto-focus input
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  // Handle clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closeSpotlight()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [closeSpotlight])

  const getResultIcon = (result: SearchResult) => {
    switch (result.type) {
      case 'calculation':
        return '🧮'
      case 'web':
        return '🌐'
      case 'file':
        return '📄'
      case 'contact':
        return '👤'
      case 'definition':
        return '📖'
      default:
        return result.icon
    }
  }

  return (
    <div className={`spotlight-overlay ${currentTheme}`}>
      <div ref={containerRef} className="spotlight-container">
        <div className="search-input-container">
          <div className="search-icon">🔍</div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Spotlight Search"
            className="search-input"
          />
        </div>

        {results.length > 0 && (
          <div className="search-results">
            {results.map((result, index) => (
              <div
                key={result.id}
                className={`search-result ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => result.action()}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="result-icon">
                  {getResultIcon(result)}
                </div>
                <div className="result-content">
                  <div className="result-title">{result.title}</div>
                  <div className="result-subtitle">{result.subtitle}</div>
                </div>
                <div className="result-type">{result.type.toUpperCase()}</div>
              </div>
            ))}
          </div>
        )}

        {query && results.length === 0 && (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <div className="no-results-text">No results found</div>
          </div>
        )}
      </div>

      <style jsx>{`
        .spotlight-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 20vh;
          z-index: 20000;
          animation: spotlightAppear 0.2s ease-out;
        }

        .spotlight-container {
          background: var(--window-bg);
          border: 1px solid var(--window-border);
          border-radius: 12px;
          box-shadow: var(--shadow-window);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          width: 640px;
          max-width: 90vw;
          max-height: 60vh;
          overflow: hidden;
          animation: spotlightSlideIn 0.3s ease-out;
        }

        .search-input-container {
          display: flex;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid var(--window-border);
        }

        .search-icon {
          font-size: 18px;
          margin-right: 12px;
          color: var(--text-secondary);
        }

        .search-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-size: 18px;
          color: var(--text-primary);
          font-family: inherit;
        }

        .search-input::placeholder {
          color: var(--text-secondary);
        }

        .search-results {
          max-height: 400px;
          overflow-y: auto;
        }

        .search-result {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          cursor: pointer;
          transition: background-color 0.15s ease;
          gap: 12px;
        }

        .search-result:hover,
        .search-result.selected {
          background: var(--accent-color);
          color: white;
        }

        .search-result.selected .result-subtitle,
        .search-result.selected .result-type {
          color: rgba(255, 255, 255, 0.8);
        }

        .result-icon {
          font-size: 24px;
          width: 32px;
          text-align: center;
          flex-shrink: 0;
        }

        .result-content {
          flex: 1;
          min-width: 0;
        }

        .result-title {
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .result-subtitle {
          font-size: 12px;
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .result-type {
          font-size: 10px;
          color: var(--text-secondary);
          font-weight: 600;
          opacity: 0.6;
          flex-shrink: 0;
        }

        .no-results {
          padding: 48px 16px;
          text-align: center;
        }

        .no-results-icon {
          font-size: 32px;
          opacity: 0.5;
          margin-bottom: 12px;
        }

        .no-results-text {
          color: var(--text-secondary);
          font-size: 14px;
        }

        @keyframes spotlightAppear {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes spotlightSlideIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        /* Custom scrollbar */
        .search-results::-webkit-scrollbar {
          width: 4px;
        }

        .search-results::-webkit-scrollbar-track {
          background: transparent;
        }

        .search-results::-webkit-scrollbar-thumb {
          background: var(--text-secondary);
          border-radius: 2px;
          opacity: 0.3;
        }

        /* Dark theme adjustments */
        .spotlight-overlay.dark {
          background: rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </div>
  )
}

export default SpotlightSearch
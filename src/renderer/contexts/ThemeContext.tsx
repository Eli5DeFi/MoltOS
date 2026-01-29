import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

type Theme = 'light' | 'dark' | 'auto'
type AccentColor = 'blue' | 'purple' | 'pink' | 'red' | 'orange' | 'yellow' | 'green' | 'graphite'

interface ThemeState {
  theme: Theme
  accentColor: AccentColor
  reducedMotion: boolean
  increasedContrast: boolean
  currentTheme: 'light' | 'dark' // Resolved theme (auto -> light/dark)
}

interface ThemeContextType extends ThemeState {
  setTheme: (theme: Theme) => void
  setAccentColor: (color: AccentColor) => void
  toggleTheme: () => void
  setReducedMotion: (enabled: boolean) => void
  setIncreasedContrast: (enabled: boolean) => void
  getSystemTheme: () => 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const accentColors = {
  blue: '#007AFF',
  purple: '#AF52DE',
  pink: '#FF2D92',
  red: '#FF3B30',
  orange: '#FF9500',
  yellow: '#FFCC00',
  green: '#34C759',
  graphite: '#8E8E93'
}

const getStoredTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('moltos-theme')
    if (stored && ['light', 'dark', 'auto'].includes(stored)) {
      return stored as Theme
    }
  }
  return 'auto'
}

const getStoredAccentColor = (): AccentColor => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('moltos-accent-color')
    if (stored && Object.keys(accentColors).includes(stored)) {
      return stored as AccentColor
    }
  }
  return 'blue'
}

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

const getSystemReducedMotion = (): boolean => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }
  return false
}

const getSystemIncreasedContrast = (): boolean => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-contrast: high)').matches
  }
  return false
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ThemeState>(() => {
    const theme = getStoredTheme()
    const systemTheme = getSystemTheme()
    const currentTheme = theme === 'auto' ? systemTheme : theme
    
    return {
      theme,
      accentColor: getStoredAccentColor(),
      reducedMotion: getSystemReducedMotion(),
      increasedContrast: getSystemIncreasedContrast(),
      currentTheme
    }
  })

  // Update current theme when theme or system preference changes
  const updateCurrentTheme = useCallback(() => {
    const systemTheme = getSystemTheme()
    const currentTheme = state.theme === 'auto' ? systemTheme : state.theme
    
    setState(prev => ({
      ...prev,
      currentTheme
    }))
    
    // Update document class
    document.documentElement.className = currentTheme
    
    // Update CSS custom properties for accent color
    const root = document.documentElement
    root.style.setProperty('--accent-color', accentColors[state.accentColor])
    root.style.setProperty('--accent-color-hover', `${accentColors[state.accentColor]}cc`)
    
    // Notify main process of theme change
    if (window.moltOS) {
      window.moltOS.theme.set(currentTheme).catch(console.error)
    }
  }, [state.theme, state.accentColor])

  const setTheme = useCallback((theme: Theme) => {
    setState(prev => ({ ...prev, theme }))
    localStorage.setItem('moltos-theme', theme)
  }, [])

  const setAccentColor = useCallback((color: AccentColor) => {
    setState(prev => ({ ...prev, accentColor: color }))
    localStorage.setItem('moltos-accent-color', color)
  }, [])

  const toggleTheme = useCallback(() => {
    const newTheme = state.currentTheme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }, [state.currentTheme, setTheme])

  const setReducedMotion = useCallback((enabled: boolean) => {
    setState(prev => ({ ...prev, reducedMotion: enabled }))
    document.documentElement.style.setProperty('--motion-reduce', enabled ? '1' : '0')
  }, [])

  const setIncreasedContrast = useCallback((enabled: boolean) => {
    setState(prev => ({ ...prev, increasedContrast: enabled }))
    document.documentElement.classList.toggle('high-contrast', enabled)
  }, [])

  // Listen for system preference changes
  useEffect(() => {
    const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const contrastQuery = window.matchMedia('(prefers-contrast: high)')

    const handleColorSchemeChange = () => {
      if (state.theme === 'auto') {
        updateCurrentTheme()
      }
    }

    const handleReducedMotionChange = () => {
      setState(prev => ({ ...prev, reducedMotion: reducedMotionQuery.matches }))
    }

    const handleContrastChange = () => {
      setState(prev => ({ ...prev, increasedContrast: contrastQuery.matches }))
    }

    colorSchemeQuery.addListener(handleColorSchemeChange)
    reducedMotionQuery.addListener(handleReducedMotionChange)
    contrastQuery.addListener(handleContrastChange)

    return () => {
      colorSchemeQuery.removeListener(handleColorSchemeChange)
      reducedMotionQuery.removeListener(handleReducedMotionChange)
      contrastQuery.removeListener(handleContrastChange)
    }
  }, [state.theme, updateCurrentTheme])

  // Update theme when state changes
  useEffect(() => {
    updateCurrentTheme()
  }, [updateCurrentTheme])

  // Set up CSS custom properties for motion and contrast
  useEffect(() => {
    document.documentElement.style.setProperty('--motion-reduce', state.reducedMotion ? '1' : '0')
    document.documentElement.classList.toggle('high-contrast', state.increasedContrast)
  }, [state.reducedMotion, state.increasedContrast])

  // Add theme transition class for smooth theme changes
  useEffect(() => {
    document.documentElement.classList.add('theme-transition')
    const timer = setTimeout(() => {
      document.documentElement.classList.remove('theme-transition')
    }, 200)
    
    return () => clearTimeout(timer)
  }, [state.currentTheme])

  const contextValue: ThemeContextType = {
    ...state,
    setTheme,
    setAccentColor,
    toggleTheme,
    setReducedMotion,
    setIncreasedContrast,
    getSystemTheme
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      <style jsx global>{`
        .theme-transition * {
          transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease !important;
        }
        
        /* High contrast mode styles */
        .high-contrast {
          --window-border: ${state.currentTheme === 'dark' ? '#ffffff' : '#000000'};
          --text-secondary: ${state.currentTheme === 'dark' ? '#ffffff' : '#000000'};
        }
        
        /* Reduced motion styles */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
        
        [style*="--motion-reduce: 1"] * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
        
        /* Accent color variations */
        :root {
          --accent-blue: #007AFF;
          --accent-purple: #AF52DE;
          --accent-pink: #FF2D92;
          --accent-red: #FF3B30;
          --accent-orange: #FF9500;
          --accent-yellow: #FFCC00;
          --accent-green: #34C759;
          --accent-graphite: #8E8E93;
        }
      `}</style>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Utility hook for theme-aware styles
export const useThemeAwareStyles = () => {
  const { currentTheme, accentColor, reducedMotion, increasedContrast } = useTheme()
  
  return {
    isDark: currentTheme === 'dark',
    isLight: currentTheme === 'light',
    accentColor: accentColors[accentColor],
    shouldReduceMotion: reducedMotion,
    hasIncreasedContrast: increasedContrast,
    getThemeValue: (lightValue: string, darkValue: string) => 
      currentTheme === 'dark' ? darkValue : lightValue
  }
}
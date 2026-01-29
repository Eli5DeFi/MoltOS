/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // macOS System Colors
        'macos': {
          'blue': '#007AFF',
          'green': '#34C759',
          'indigo': '#5856D6',
          'orange': '#FF9500',
          'pink': '#FF2D92',
          'purple': '#AF52DE',
          'red': '#FF3B30',
          'teal': '#5AC8FA',
          'yellow': '#FFCC00',
          'gray': {
            50: '#F9F9F9',
            100: '#F2F2F7',
            200: '#E5E5EA',
            300: '#D1D1D6',
            400: '#C7C7CC',
            500: '#AEAEB2',
            600: '#8E8E93',
            700: '#636366',
            800: '#48484A',
            900: '#2C2C2E',
            950: '#1C1C1E'
          },
          'background': {
            'primary': '#FFFFFF',
            'secondary': '#F2F2F7',
            'tertiary': '#FFFFFF'
          }
        },
        // Dark mode variants
        'macos-dark': {
          'background': {
            'primary': '#1C1C1E',
            'secondary': '#2C2C2E',
            'tertiary': '#3A3A3C'
          }
        }
      },
      fontFamily: {
        'sf-pro': ['-apple-system', 'SF Pro Display', 'SF Pro Text', 'system-ui', 'sans-serif'],
        'sf-mono': ['SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'monospace']
      },
      fontSize: {
        'xs': ['11px', '16px'],
        'sm': ['12px', '18px'],
        'base': ['13px', '20px'],
        'lg': ['15px', '22px'],
        'xl': ['17px', '24px'],
        '2xl': ['20px', '28px'],
        '3xl': ['24px', '32px'],
        '4xl': ['28px', '36px'],
        '5xl': ['34px', '42px']
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem'
      },
      borderRadius: {
        'macos': '8px',
        'macos-sm': '4px',
        'macos-lg': '12px'
      },
      boxShadow: {
        'macos': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'macos-lg': '0 8px 32px rgba(0, 0, 0, 0.16)',
        'macos-dock': '0 0 32px rgba(0, 0, 0, 0.3)',
        'macos-window': '0 2px 20px rgba(0, 0, 0, 0.15)',
        'macos-menu': '0 4px 20px rgba(0, 0, 0, 0.2)'
      },
      backdropBlur: {
        'macos': '20px'
      },
      animation: {
        'bounce-subtle': 'bounce-subtle 0.3s ease-in-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out'
      },
      keyframes: {
        'bounce-subtle': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' }
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio')
  ],
  darkMode: 'class'
}
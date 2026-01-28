# MoltOS - macOS-Style Desktop Environment

A fully functional, beautiful macOS-inspired desktop environment for Moltbot, built with React, TypeScript, and Framer Motion.

## Features

### Complete Desktop Environment
- **Menu Bar** with live system status (time, battery, wifi, Clawdbot status)
- **Desktop** with elegant gradient wallpaper
- **Dock** with 10 native-looking applications and hover effects
- **Window Management** with drag, resize, minimize, maximize
- **Multi-tasking** support for multiple open windows

### Applications

| App | Description |
|-----|-------------|
| 💬 **Chat** | Full messaging interface with bot conversations |
| 📈 **Apps** | Clawdhub App Store with card-style skill listings |
| ✨ **Skills** | Flippable cards showing all skills and usage |
| 🔴 **Monitor** | System performance + Crabwalk integration |
| ⬛ **Terminal** | Interactive command-line with fun commands |
| 📁 **Files** | File browser for workspace management |
| 📅 **Calendar** | Event scheduling and management |
| 📧 **Mail** | AgentMail email client integration |
| 🤖 **Agents** | Multi-agent management and deployment |
| ⚙️ **Settings** | Complete system configuration (Pro & Simple modes) |

### Design Features
- Pixel-perfect macOS aesthetics with native controls
- Smooth animations powered by Framer Motion
- Glassmorphism effects with backdrop blur
- Traffic light window controls (close/minimize/maximize)
- Dock hover effects with scaling
- Responsive design for all screen sizes

## Tech Stack

- **React 18** with TypeScript for type safety
- **Framer Motion** for smooth animations
- **Tailwind CSS v4** for rapid styling
- **Zustand** for state management
- **Vite** for lightning-fast development
- **Lucide React** for beautiful icons

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Integration Points

- **Clawdbot Gateway API** - Connection ready for AI assistant
- **Crabwalk Monitoring** - System performance tracking
- **AgentMail** - Email system integration
- **Real-time WebSocket** - Live updates capability
- **File System Access** - Workspace management

## Project Structure

```
src/
├── components/
│   ├── desktop/       # Desktop, MenuBar, Dock, Window
│   └── apps/          # All 10 application components
├── store/             # Zustand state management
├── types/             # TypeScript type definitions
└── index.css          # Tailwind CSS with custom theme
```

## License

MIT

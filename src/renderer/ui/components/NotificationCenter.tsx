import React, { useState, useCallback, useEffect } from 'react'
import { useDesktop } from '../../contexts/DesktopContext'
import { useTheme } from '../../contexts/ThemeContext'

interface Notification {
  id: string
  title: string
  subtitle: string
  body: string
  icon: string
  app: string
  timestamp: Date
  isRead: boolean
  actions?: Array<{
    id: string
    title: string
    action: () => void
  }>
}

interface Widget {
  id: string
  type: 'weather' | 'calendar' | 'stocks' | 'notes'
  title: string
  content: React.ReactNode
}

const NotificationCenter: React.FC = () => {
  const { hideNotificationCenter } = useDesktop()
  const { currentTheme } = useTheme()
  const [activeTab, setActiveTab] = useState<'notifications' | 'widgets'>('notifications')
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Welcome to MoltBot OS',
      subtitle: 'Getting Started',
      body: 'Your premium macOS experience is ready! Explore apps, customize settings, and enjoy the seamless workflow.',
      icon: '🤖',
      app: 'MoltBot',
      timestamp: new Date(),
      isRead: false
    },
    {
      id: '2',
      title: 'System Update Available',
      subtitle: 'MoltOS 1.1.0',
      body: 'New features and improvements are available. Update now for the best experience.',
      icon: '🔄',
      app: 'System',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      isRead: false,
      actions: [
        { id: 'update', title: 'Update Now', action: () => console.log('Update') },
        { id: 'later', title: 'Remind Me Later', action: () => console.log('Remind later') }
      ]
    }
  ])

  const widgets: Widget[] = [
    {
      id: 'weather',
      type: 'weather',
      title: 'Weather',
      content: (
        <div className="weather-widget">
          <div className="weather-main">
            <div className="temperature">22°</div>
            <div className="weather-icon">☀️</div>
          </div>
          <div className="weather-details">
            <div>Sunny</div>
            <div>San Francisco</div>
          </div>
        </div>
      )
    },
    {
      id: 'calendar',
      type: 'calendar',
      title: 'Calendar',
      content: (
        <div className="calendar-widget">
          <div className="calendar-date">
            <div className="day-name">Today</div>
            <div className="date">{new Date().toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric' 
            })}</div>
          </div>
          <div className="calendar-events">
            <div className="event">
              <div className="event-time">2:00 PM</div>
              <div className="event-title">Team Meeting</div>
            </div>
          </div>
        </div>
      )
    }
  ]

  const handleNotificationClick = useCallback((notification: Notification) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notification.id ? { ...n, isRead: true } : n
      )
    )
  }, [])

  const handleNotificationAction = useCallback((notificationId: string, actionId: string) => {
    const notification = notifications.find(n => n.id === notificationId)
    const action = notification?.actions?.find(a => a.id === actionId)
    if (action) {
      action.action()
      
      // Remove notification after action
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
    }
  }, [notifications])

  const clearAllNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  // Handle clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.notification-center') && !target.closest('.notification-center-trigger')) {
        hideNotificationCenter()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [hideNotificationCenter])

  return (
    <div className={`notification-center ${currentTheme}`}>
      <div className="notification-header">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
          </button>
          <button 
            className={`tab ${activeTab === 'widgets' ? 'active' : ''}`}
            onClick={() => setActiveTab('widgets')}
          >
            Widgets
          </button>
        </div>
        
        <button 
          className="close-button"
          onClick={hideNotificationCenter}
          aria-label="Close Notification Center"
        >
          ✕
        </button>
      </div>

      <div className="notification-content">
        {activeTab === 'notifications' ? (
          <div className="notifications-tab">
            {notifications.length > 0 && (
              <div className="notifications-actions">
                <button onClick={clearAllNotifications} className="clear-all">
                  Clear All
                </button>
              </div>
            )}
            
            <div className="notifications-list">
              {notifications.length === 0 ? (
                <div className="no-notifications">
                  <div className="no-notifications-icon">🔔</div>
                  <div className="no-notifications-text">No new notifications</div>
                </div>
              ) : (
                notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="notification-icon">
                      {notification.icon}
                    </div>
                    
                    <div className="notification-body">
                      <div className="notification-header-text">
                        <div className="notification-title">{notification.title}</div>
                        <div className="notification-time">
                          {formatTimestamp(notification.timestamp)}
                        </div>
                      </div>
                      
                      <div className="notification-subtitle">
                        {notification.subtitle}
                      </div>
                      
                      <div className="notification-message">
                        {notification.body}
                      </div>
                      
                      {notification.actions && (
                        <div className="notification-actions">
                          {notification.actions.map(action => (
                            <button
                              key={action.id}
                              className="notification-action"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleNotificationAction(notification.id, action.id)
                              }}
                            >
                              {action.title}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="widgets-tab">
            <div className="widgets-grid">
              {widgets.map(widget => (
                <div key={widget.id} className="widget-card">
                  <div className="widget-header">
                    <div className="widget-title">{widget.title}</div>
                  </div>
                  <div className="widget-content">
                    {widget.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .notification-center {
          position: fixed;
          top: 24px;
          right: 8px;
          width: 360px;
          max-height: calc(100vh - 40px);
          background: var(--window-bg);
          border: 1px solid var(--window-border);
          border-radius: 12px;
          box-shadow: var(--shadow-window);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          z-index: 15000;
          animation: slideInRight 0.3s ease-out;
          display: flex;
          flex-direction: column;
        }

        .notification-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid var(--window-border);
        }

        .tabs {
          display: flex;
          gap: 8px;
        }

        .tab {
          padding: 6px 12px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .tab.active {
          background: var(--accent-color);
          color: white;
        }

        .close-button {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 14px;
          padding: 4px;
          border-radius: 4px;
          transition: background-color 0.2s ease;
        }

        .close-button:hover {
          background: var(--surface-primary);
        }

        .notification-content {
          flex: 1;
          overflow-y: auto;
          min-height: 0;
        }

        .notifications-actions {
          padding: 8px 16px;
          border-bottom: 1px solid var(--window-border);
        }

        .clear-all {
          background: none;
          border: none;
          color: var(--accent-color);
          cursor: pointer;
          font-size: 12px;
          padding: 4px 0;
        }

        .notifications-list {
          padding: 8px 0;
        }

        .notification-item {
          display: flex;
          gap: 12px;
          padding: 12px 16px;
          cursor: pointer;
          transition: background-color 0.2s ease;
          border-left: 3px solid transparent;
        }

        .notification-item.unread {
          border-left-color: var(--accent-color);
        }

        .notification-item:hover {
          background: var(--surface-primary);
        }

        .notification-icon {
          font-size: 20px;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .notification-body {
          flex: 1;
          min-width: 0;
        }

        .notification-header-text {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
          margin-bottom: 4px;
        }

        .notification-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .notification-time {
          font-size: 11px;
          color: var(--text-secondary);
          flex-shrink: 0;
        }

        .notification-subtitle {
          font-size: 12px;
          color: var(--text-secondary);
          margin-bottom: 4px;
        }

        .notification-message {
          font-size: 12px;
          color: var(--text-primary);
          line-height: 1.4;
        }

        .notification-actions {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }

        .notification-action {
          background: var(--surface-primary);
          border: 1px solid var(--window-border);
          color: var(--text-primary);
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .notification-action:hover {
          background: var(--accent-color);
          color: white;
          border-color: var(--accent-color);
        }

        .no-notifications {
          padding: 48px 16px;
          text-align: center;
        }

        .no-notifications-icon {
          font-size: 32px;
          opacity: 0.5;
          margin-bottom: 12px;
        }

        .no-notifications-text {
          color: var(--text-secondary);
          font-size: 14px;
        }

        .widgets-tab {
          padding: 16px;
        }

        .widgets-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .widget-card {
          background: var(--surface-primary);
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid var(--window-border);
        }

        .widget-header {
          padding: 8px 12px;
          border-bottom: 1px solid var(--window-border);
          background: var(--surface-secondary);
        }

        .widget-title {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .widget-content {
          padding: 12px;
        }

        /* Weather Widget */
        .weather-widget {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .weather-main {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .temperature {
          font-size: 20px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .weather-icon {
          font-size: 18px;
        }

        .weather-details {
          flex: 1;
          font-size: 11px;
          color: var(--text-secondary);
        }

        /* Calendar Widget */
        .calendar-widget {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .calendar-date .day-name {
          font-size: 11px;
          color: var(--text-secondary);
        }

        .calendar-date .date {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .calendar-events {
          border-top: 1px solid var(--window-border);
          padding-top: 8px;
        }

        .event {
          display: flex;
          gap: 8px;
          font-size: 11px;
        }

        .event-time {
          color: var(--text-secondary);
          min-width: 50px;
        }

        .event-title {
          color: var(--text-primary);
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* Custom scrollbar */
        .notification-content::-webkit-scrollbar {
          width: 4px;
        }

        .notification-content::-webkit-scrollbar-track {
          background: transparent;
        }

        .notification-content::-webkit-scrollbar-thumb {
          background: var(--text-secondary);
          border-radius: 2px;
          opacity: 0.3;
        }
      `}</style>
    </div>
  )
}

export default NotificationCenter
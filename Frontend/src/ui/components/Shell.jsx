import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

export function Sidebar({ onExportData, onShowNotifications }) {
  const location = useLocation()
  const isActive = (path) => location.pathname === path

  const handleExportData = () => {
    if (onExportData) {
      onExportData()
    } else {
      // Default export functionality
      const data = {
        exported_at: new Date().toISOString(),
        message: 'Data export feature - connect to your backend API'
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `export-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleNotifications = () => {
    if (onShowNotifications) {
      onShowNotifications()
    } else {
      alert('Notifications feature - You have 0 new notifications')
    }
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="logo">V</div>
        <span className="brand-name">QUEEN</span>
      </div>
      <nav className="nav">
        <div className="nav-section">
          <div className="nav-title">Main</div>
          <Link className={`nav-item ${isActive('/') ? 'active' : ''}`} to="/">
            <span>📊</span> Dashboard
          </Link>
          <Link className={`nav-item ${isActive('/analytics') ? 'active' : ''}`} to="/analytics">
            <span>📈</span> Analytics
          </Link>
          <Link className={`nav-item ${isActive('/explorer') ? 'active' : ''}`} to="/explorer">
            <span>🔍</span> Data Explorer
          </Link>
          <Link className={`nav-item ${isActive('/reports') ? 'active' : ''}`} to="/reports">
            <span>📄</span> Reports
          </Link>
          <Link className={`nav-item ${isActive('/help') ? 'active' : ''}`} to="/help">
            <span>❓</span> Help
          </Link>
        </div>
        <div className="nav-section">
          <div className="nav-title">Quick Actions</div>
          <button className="nav-item" onClick={handleExportData} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}>
            <span>📥</span> Export Data
          </button>
          <button className="nav-item" onClick={handleNotifications} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}>
            <span>🔔</span> Notifications
          </button>
          <Link className={`nav-item ${isActive('/settings') ? 'active' : ''}`} to="/settings">
            <span>⚙️</span> Settings
          </Link>
        </div>
      </nav>
    </aside>
  )
}

export function Topbar({ onLogout, onMenu, onShowNotifications }) {
  const [showNotifications, setShowNotifications] = useState(false)

  const notifications = [
    { id: 1, title: 'New data available', message: 'Dashboard data has been updated', time: '5m ago', read: false },
    { id: 2, title: 'Export completed', message: 'Your data export is ready for download', time: '1h ago', read: false },
    { id: 3, title: 'System update', message: 'New features have been added', time: '2h ago', read: true },
    { id: 4, title: 'Welcome!', message: 'Thanks for using QUEEN Dashboard', time: '1d ago', read: true },
  ]

  const unreadCount = notifications.filter(n => !n.read).length

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications)
  }

  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (showNotifications && !e.target.closest('.notifications-container')) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showNotifications])

  return (
    <header className="topbar">
      <button className="icon-btn menu-btn" onClick={onMenu} aria-label="Open menu" style={{ marginRight: 8 }}>☰</button>
      <div className="search">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input type="search" placeholder="Search" />
      </div>
      <div className="top-actions">
        <ThemeToggle />
        <div className="notifications-container">
          <button
            className="icon-btn notification-btn"
            title="Notifications"
            onClick={handleNotificationClick}
          >
            🔔
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>

          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="notifications-header">
                <h4>Notifications</h4>
                <span className="notifications-count">{unreadCount} new</span>
              </div>

              <div className="notifications-list">
                {notifications.length === 0 ? (
                  <div className="notification-empty">
                    <span>🔔</span>
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div
                      key={notif.id}
                      className={`notification-item ${notif.read ? 'read' : 'unread'}`}
                    >
                      <div className="notification-content">
                        <div className="notification-title">{notif.title}</div>
                        <div className="notification-message">{notif.message}</div>
                        <div className="notification-time">{notif.time}</div>
                      </div>
                      {!notif.read && <span className="notification-dot"></span>}
                    </div>
                  ))
                )}
              </div>

              <div className="notifications-footer">
                <button className="notifications-action" onClick={() => setShowNotifications(false)}>
                  Mark all as read
                </button>
                <button className="notifications-action" onClick={() => setShowNotifications(false)}>
                  View all
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="avatar" title="Account"></div>
        {/* <button className="btn small" onClick={onLogout}>Logout</button> */}
      </div>
    </header>
  )
}

import React, { useState, useEffect } from 'react'
import { Sidebar, Topbar } from '../components/Shell'
import api from '../../services/api'

export default function Settings({ setTheme }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [activeTab, setActiveTab] = useState('profile')
  
  const [settings, setSettings] = useState({
    theme: localStorage.getItem('theme') || 'light',
    notifications: true,
    autoRefresh: false,
    dataLimit: '100',
    language: 'en'
  })

  const onThemeToggle = () => {
    const newTheme = document.documentElement.classList.contains('light') ? 'dark' : 'light'
    setTheme(newTheme)
    setSettings(prev => ({ ...prev, theme: newTheme }))
  }

  const onLogout = async () => {
    try {
      await api.logout()
    } catch (err) {
      console.error('Logout error:', err)
    }
    localStorage.removeItem('auth')
    location.href = '/login'
  }

  useEffect(() => {
    document.body.classList.toggle('mobile-open', mobileOpen)
    return () => document.body.classList.remove('mobile-open')
  }, [mobileOpen])

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await api.getMe()
        setUser(data.user)
      } catch (err) {
        console.error('Failed to fetch user:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    
    setTimeout(() => {
      localStorage.setItem('settings', JSON.stringify(settings))
      setSaving(false)
      setMessage({ type: 'success', text: 'Settings saved successfully!' })
      setTimeout(() => setMessage(null), 3000)
    }, 500)
  }

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <div className="dashboard">
        <Sidebar />
        <div className="main">
          <Topbar onThemeToggle={onThemeToggle} onLogout={onLogout} onMenu={() => setMobileOpen(true)} />
          <main className="content" style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
            <div style={{ textAlign: 'center' }}>
              <div className="spinner"></div>
              <p className="muted" style={{ marginTop: '12px' }}>Loading settings...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main">
        <Topbar onThemeToggle={onThemeToggle} onLogout={onLogout} onMenu={() => setMobileOpen(true)} />
        <main className="content">
          <div className="page-header">
            <h1>Settings</h1>
            <p className="muted">Manage your account and application preferences</p>
          </div>

          {message && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}

          <div className="settings-container">
            <div className="card settings-tabs">
              <button
                className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                👤 Profile
              </button>
              <button
                className={`settings-tab ${activeTab === 'preferences' ? 'active' : ''}`}
                onClick={() => setActiveTab('preferences')}
              >
                ⚙️ Preferences
              </button>
              <button
                className={`settings-tab ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                🔒 Security
              </button>
              <button
                className={`settings-tab ${activeTab === 'about' ? 'active' : ''}`}
                onClick={() => setActiveTab('about')}
              >
                ℹ️ About
              </button>
            </div>

            <div className="settings-content">
              {activeTab === 'profile' && (
                <div className="card settings-section">
                  <h3>Profile Information</h3>
                  <div className="settings-group">
                    <div className="profile-avatar">
                      <div className="avatar large">{user?.name?.[0]?.toUpperCase() || 'A'}</div>
                      <div className="profile-info">
                        <h4>{user?.name || 'Administrator'}</h4>
                        <p className="muted">{user?.email || 'admin'}</p>
                      </div>
                    </div>

                    <div className="setting-item">
                      <label>Full Name</label>
                      <input
                        type="text"
                        value={user?.name || ''}
                        readOnly
                        className="filter-input"
                        placeholder="Your name"
                      />
                    </div>

                    <div className="setting-item">
                      <label>Email / Username</label>
                      <input
                        type="text"
                        value={user?.email || ''}
                        readOnly
                        className="filter-input"
                        placeholder="your@email.com"
                      />
                    </div>

                    <div className="setting-item">
                      <label>Account Type</label>
                      <input
                        type="text"
                        value={user?.provider === 'google' ? 'Google Account' : 'Local Account'}
                        readOnly
                        className="filter-input"
                      />
                    </div>

                    <div className="setting-item">
                      <label>Member Since</label>
                      <input
                        type="text"
                        value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        readOnly
                        className="filter-input"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="card settings-section">
                  <h3>Application Preferences</h3>
                  <div className="settings-group">
                    <div className="setting-item">
                      <div className="setting-header">
                        <label>Theme</label>
                        <p className="setting-desc">Choose your preferred color scheme</p>
                      </div>
                      <select
                        value={settings.theme}
                        onChange={(e) => {
                          handleSettingChange('theme', e.target.value)
                          setTheme(e.target.value)
                        }}
                        className="filter-select"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                      </select>
                    </div>

                    <div className="setting-item">
                      <div className="setting-header">
                        <label>Data Refresh Limit</label>
                        <p className="setting-desc">Maximum records to fetch per request</p>
                      </div>
                      <select
                        value={settings.dataLimit}
                        onChange={(e) => handleSettingChange('dataLimit', e.target.value)}
                        className="filter-select"
                      >
                        <option value="50">50 records</option>
                        <option value="100">100 records</option>
                        <option value="500">500 records</option>
                        <option value="1000">1000 records</option>
                      </select>
                    </div>

                    <div className="setting-item">
                      <div className="setting-header">
                        <label>Language</label>
                        <p className="setting-desc">Select your preferred language</p>
                      </div>
                      <select
                        value={settings.language}
                        onChange={(e) => handleSettingChange('language', e.target.value)}
                        className="filter-select"
                      >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                      </select>
                    </div>

                    <div className="setting-item checkbox-item">
                      <div className="setting-header">
                        <label>Enable Notifications</label>
                        <p className="setting-desc">Receive updates about data changes</p>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={settings.notifications}
                          onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    <div className="setting-item checkbox-item">
                      <div className="setting-header">
                        <label>Auto-refresh Data</label>
                        <p className="setting-desc">Automatically refresh data every 5 minutes</p>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={settings.autoRefresh}
                          onChange={(e) => handleSettingChange('autoRefresh', e.target.checked)}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="btn primary"
                      style={{ marginTop: '16px' }}
                    >
                      {saving ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="card settings-section">
                  <h3>Security Settings</h3>
                  <div className="settings-group">
                    <div className="security-info">
                      <div className="security-item">
                        <span className="security-icon">🔐</span>
                        <div>
                          <h4>Password</h4>
                          <p className="muted">
                            {user?.provider === 'google' 
                              ? 'Managed by Google' 
                              : 'Last changed: Never'}
                          </p>
                        </div>
                        <button className="btn small" disabled={user?.provider === 'google'}>
                          Change
                        </button>
                      </div>

                      <div className="security-item">
                        <span className="security-icon">📱</span>
                        <div>
                          <h4>Two-Factor Authentication</h4>
                          <p className="muted">Add an extra layer of security</p>
                        </div>
                        <button className="btn small">Enable</button>
                      </div>

                      <div className="security-item">
                        <span className="security-icon">🔗</span>
                        <div>
                          <h4>Connected Accounts</h4>
                          <p className="muted">
                            {user?.provider === 'google' ? 'Google connected' : 'No accounts connected'}
                          </p>
                        </div>
                        <button className="btn small">Manage</button>
                      </div>

                      <div className="security-item">
                        <span className="security-icon">📜</span>
                        <div>
                          <h4>Activity Log</h4>
                          <p className="muted">View your recent account activity</p>
                        </div>
                        <button className="btn small">View Log</button>
                      </div>
                    </div>

                    <div className="danger-zone">
                      <h4>Danger Zone</h4>
                      <p className="muted">Irreversible actions</p>
                      <button className="btn danger" onClick={() => {
                        if (confirm('Are you sure you want to logout?')) {
                          onLogout()
                        }
                      }}>
                        Logout from All Devices
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'about' && (
                <div className="card settings-section">
                  <h3>About QUEEN Dashboard</h3>
                  <div className="settings-group">
                    <div className="about-section">
                      <div className="about-logo">
                        <div className="logo large">V</div>
                        <h2>QUEEN</h2>
                      </div>

                      <div className="about-info">
                        <div className="info-item">
                          <span className="info-label">Version</span>
                          <span className="info-value">1.0.0</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Build</span>
                          <span className="info-value">2024.11.04</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Environment</span>
                          <span className="info-value">Development</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">API Status</span>
                          <span className="info-value status-active">● Active</span>
                        </div>
                      </div>

                      <div className="about-description">
                        <h4>Features</h4>
                        <ul>
                          <li>Real-time data analytics and visualization</li>
                          <li>Advanced filtering and search capabilities</li>
                          <li>Comprehensive reporting tools</li>
                          <li>Secure authentication with OAuth support</li>
                          <li>Responsive design for all devices</li>
                        </ul>
                      </div>

                      <div className="about-links">
                        <a href="#" className="link" onClick={(e) => e.preventDefault()}>Documentation</a>
                        <span>•</span>
                        <a href="#" className="link" onClick={(e) => e.preventDefault()}>Support</a>
                        <span>•</span>
                        <a href="#" className="link" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
                        <span>•</span>
                        <a href="#" className="link" onClick={(e) => e.preventDefault()}>Terms of Service</a>
                      </div>

                      <p className="muted small" style={{ marginTop: '24px', textAlign: 'center' }}>
                        © 2024 QUEEN Dashboard. All rights reserved.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      {mobileOpen && <div className="backdrop" onClick={() => setMobileOpen(false)} />}
    </div>
  )
}

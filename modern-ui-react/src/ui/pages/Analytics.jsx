import React, { useMemo } from 'react'
import { Sidebar, Topbar } from '../components/Shell'
import { useData } from '../../context/DataContext'

export default function Analytics({ setTheme }) {
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const { records, loading } = useData()
  
  const onThemeToggle = () => setTheme(document.documentElement.classList.contains('light') ? 'dark' : 'light')
  const onLogout = () => {
    localStorage.removeItem('auth')
    location.href = '/login'
  }

  React.useEffect(() => {
    document.body.classList.toggle('mobile-open', mobileOpen)
    return () => document.body.classList.remove('mobile-open')
  }, [mobileOpen])

  const analytics = useMemo(() => {
    if (!records.length) return null

    const byCountry = records.reduce((acc, r) => {
      if (r.country) {
        acc[r.country] = (acc[r.country] || 0) + 1
      }
      return acc
    }, {})

    const bySector = records.reduce((acc, r) => {
      if (r.sector) {
        acc[r.sector] = (acc[r.sector] || 0) + 1
      }
      return acc
    }, {})

    const byTopic = records.reduce((acc, r) => {
      if (r.topic) {
        acc[r.topic] = (acc[r.topic] || 0) + 1
      }
      return acc
    }, {})

    const byRegion = records.reduce((acc, r) => {
      if (r.region) {
        acc[r.region] = (acc[r.region] || 0) + 1
      }
      return acc
    }, {})

    const topCountries = Object.entries(byCountry)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)

    const topSectors = Object.entries(bySector)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)

    const topTopics = Object.entries(byTopic)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)

    const topRegions = Object.entries(byRegion)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)

    const avgIntensity = records.filter(r => r.intensity).reduce((sum, r) => sum + r.intensity, 0) / records.filter(r => r.intensity).length
    const avgLikelihood = records.filter(r => r.likelihood).reduce((sum, r) => sum + r.likelihood, 0) / records.filter(r => r.likelihood).length
    const avgRelevance = records.filter(r => r.relevance).reduce((sum, r) => sum + r.relevance, 0) / records.filter(r => r.relevance).length

    return {
      topCountries,
      topSectors,
      topTopics,
      topRegions,
      avgIntensity: avgIntensity.toFixed(1),
      avgLikelihood: avgLikelihood.toFixed(1),
      avgRelevance: avgRelevance.toFixed(1),
      totalRecords: records.length
    }
  }, [records])

  if (loading) {
    return (
      <div className="dashboard">
        <Sidebar />
        <div className="main">
          <Topbar onThemeToggle={onThemeToggle} onLogout={onLogout} onMenu={() => setMobileOpen(true)} />
          <main className="content" style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
            <div style={{ textAlign: 'center' }}>
              <div className="spinner"></div>
              <p className="muted" style={{ marginTop: '12px' }}>Loading analytics...</p>
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
            <h1>Analytics Overview</h1>
            <p className="muted">Comprehensive insights from {analytics?.totalRecords} data records</p>
          </div>

          <div className="analytics-grid">
            <div className="card metric-card">
              <div className="metric-icon" style={{ background: 'linear-gradient(135deg, #7367F0, #9E8CFC)' }}>📊</div>
              <div className="metric-content">
                <div className="metric-label">Total Records</div>
                <div className="metric-value">{analytics?.totalRecords}</div>
              </div>
            </div>

            <div className="card metric-card">
              <div className="metric-icon" style={{ background: 'linear-gradient(135deg, #28C76F, #48DA89)' }}>⚡</div>
              <div className="metric-content">
                <div className="metric-label">Avg Intensity</div>
                <div className="metric-value">{analytics?.avgIntensity}</div>
              </div>
            </div>

            <div className="card metric-card">
              <div className="metric-icon" style={{ background: 'linear-gradient(135deg, #FF9F43, #FFBB70)' }}>🎯</div>
              <div className="metric-content">
                <div className="metric-label">Avg Likelihood</div>
                <div className="metric-value">{analytics?.avgLikelihood}</div>
              </div>
            </div>

            <div className="card metric-card">
              <div className="metric-icon" style={{ background: 'linear-gradient(135deg, #EA5455, #FF6B6B)' }}>🔥</div>
              <div className="metric-content">
                <div className="metric-label">Avg Relevance</div>
                <div className="metric-value">{analytics?.avgRelevance}</div>
              </div>
            </div>

            <div className="card data-list-card">
              <h3>Top Countries</h3>
              <div className="data-list">
                {analytics?.topCountries.map(([country, count]) => (
                  <div key={country} className="data-item">
                    <span className="data-label">{country}</span>
                    <div className="data-bar-container">
                      <div className="data-bar" style={{ width: `${(count / analytics.topCountries[0][1]) * 100}%` }}></div>
                      <span className="data-value">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card data-list-card">
              <h3>Top Sectors</h3>
              <div className="data-list">
                {analytics?.topSectors.map(([sector, count]) => (
                  <div key={sector} className="data-item">
                    <span className="data-label">{sector}</span>
                    <div className="data-bar-container">
                      <div className="data-bar" style={{ width: `${(count / analytics.topSectors[0][1]) * 100}%` }}></div>
                      <span className="data-value">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card data-list-card wide">
              <h3>Top Topics</h3>
              <div className="data-list">
                {analytics?.topTopics.map(([topic, count]) => (
                  <div key={topic} className="data-item">
                    <span className="data-label">{topic}</span>
                    <div className="data-bar-container">
                      <div className="data-bar" style={{ width: `${(count / analytics.topTopics[0][1]) * 100}%` }}></div>
                      <span className="data-value">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card data-list-card">
              <h3>Top Regions</h3>
              <div className="data-list">
                {analytics?.topRegions.map(([region, count]) => (
                  <div key={region} className="data-item">
                    <span className="data-label">{region}</span>
                    <div className="data-bar-container">
                      <div className="data-bar" style={{ width: `${(count / analytics.topRegions[0][1]) * 100}%` }}></div>
                      <span className="data-value">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
      {mobileOpen && <div className="backdrop" onClick={() => setMobileOpen(false)} />}
    </div>
  )
}

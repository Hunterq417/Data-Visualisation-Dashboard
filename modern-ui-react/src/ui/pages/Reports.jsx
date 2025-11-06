import React, { useMemo } from 'react'
import { Sidebar, Topbar } from '../components/Shell'
import { useData } from '../../context/DataContext'

export default function Reports({ setTheme }) {
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

  const report = useMemo(() => {
    if (!records.length) return null

    const totalRecords = records.length
    const recordsWithIntensity = records.filter(r => r.intensity != null)
    const recordsWithLikelihood = records.filter(r => r.likelihood != null)
    const recordsWithRelevance = records.filter(r => r.relevance != null)

    const byYear = records.reduce((acc, r) => {
      const year = r.year || r.end_year || 'Unknown'
      acc[year] = (acc[year] || 0) + 1
      return acc
    }, {})

    const byPestle = records.reduce((acc, r) => {
      if (r.pestle) acc[r.pestle] = (acc[r.pestle] || 0) + 1
      return acc
    }, {})

    const bySource = records.reduce((acc, r) => {
      if (r.source) acc[r.source] = (acc[r.source] || 0) + 1
      return acc
    }, {})

    return {
      totalRecords,
      recordsWithIntensity: recordsWithIntensity.length,
      recordsWithLikelihood: recordsWithLikelihood.length,
      recordsWithRelevance: recordsWithRelevance.length,
      avgIntensity: (recordsWithIntensity.reduce((sum, r) => sum + r.intensity, 0) / recordsWithIntensity.length).toFixed(2),
      avgLikelihood: (recordsWithLikelihood.reduce((sum, r) => sum + r.likelihood, 0) / recordsWithLikelihood.length).toFixed(2),
      avgRelevance: (recordsWithRelevance.reduce((sum, r) => sum + r.relevance, 0) / recordsWithRelevance.length).toFixed(2),
      maxIntensity: Math.max(...recordsWithIntensity.map(r => r.intensity)),
      maxLikelihood: Math.max(...recordsWithLikelihood.map(r => r.likelihood)),
      maxRelevance: Math.max(...recordsWithRelevance.map(r => r.relevance)),
      uniqueCountries: new Set(records.filter(r => r.country).map(r => r.country)).size,
      uniqueRegions: new Set(records.filter(r => r.region).map(r => r.region)).size,
      uniqueSectors: new Set(records.filter(r => r.sector).map(r => r.sector)).size,
      uniqueTopics: new Set(records.filter(r => r.topic).map(r => r.topic)).size,
      yearDistribution: Object.entries(byYear).sort((a, b) => b[1] - a[1]).slice(0, 10),
      pestleDistribution: Object.entries(byPestle).sort((a, b) => b[1] - a[1]),
      topSources: Object.entries(bySource).sort((a, b) => b[1] - a[1]).slice(0, 10)
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
              <p className="muted" style={{ marginTop: '12px' }}>Generating report...</p>
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
            <h1>Data Reports</h1>
            <p className="muted">Comprehensive data analysis and statistics</p>
          </div>

          <div className="reports-grid">
            <div className="card report-section">
              <h3>📊 Data Coverage</h3>
              <div className="report-stats">
                <div className="report-stat">
                  <span className="stat-label">Total Records</span>
                  <span className="stat-value">{report?.totalRecords}</span>
                </div>
                <div className="report-stat">
                  <span className="stat-label">With Intensity</span>
                  <span className="stat-value">{report?.recordsWithIntensity}</span>
                </div>
                <div className="report-stat">
                  <span className="stat-label">With Likelihood</span>
                  <span className="stat-value">{report?.recordsWithLikelihood}</span>
                </div>
                <div className="report-stat">
                  <span className="stat-label">With Relevance</span>
                  <span className="stat-value">{report?.recordsWithRelevance}</span>
                </div>
              </div>
            </div>

            <div className="card report-section">
              <h3>📈 Average Metrics</h3>
              <div className="report-stats">
                <div className="report-stat">
                  <span className="stat-label">Avg Intensity</span>
                  <span className="stat-value highlight-green">{report?.avgIntensity}</span>
                </div>
                <div className="report-stat">
                  <span className="stat-label">Avg Likelihood</span>
                  <span className="stat-value highlight-blue">{report?.avgLikelihood}</span>
                </div>
                <div className="report-stat">
                  <span className="stat-label">Avg Relevance</span>
                  <span className="stat-value highlight-orange">{report?.avgRelevance}</span>
                </div>
              </div>
            </div>

            <div className="card report-section">
              <h3>🔝 Maximum Values</h3>
              <div className="report-stats">
                <div className="report-stat">
                  <span className="stat-label">Max Intensity</span>
                  <span className="stat-value">{report?.maxIntensity}</span>
                </div>
                <div className="report-stat">
                  <span className="stat-label">Max Likelihood</span>
                  <span className="stat-value">{report?.maxLikelihood}</span>
                </div>
                <div className="report-stat">
                  <span className="stat-label">Max Relevance</span>
                  <span className="stat-value">{report?.maxRelevance}</span>
                </div>
              </div>
            </div>

            <div className="card report-section">
              <h3>🌍 Geographic Coverage</h3>
              <div className="report-stats">
                <div className="report-stat">
                  <span className="stat-label">Unique Countries</span>
                  <span className="stat-value">{report?.uniqueCountries}</span>
                </div>
                <div className="report-stat">
                  <span className="stat-label">Unique Regions</span>
                  <span className="stat-value">{report?.uniqueRegions}</span>
                </div>
                <div className="report-stat">
                  <span className="stat-label">Unique Sectors</span>
                  <span className="stat-value">{report?.uniqueSectors}</span>
                </div>
                <div className="report-stat">
                  <span className="stat-label">Unique Topics</span>
                  <span className="stat-value">{report?.uniqueTopics}</span>
                </div>
              </div>
            </div>

            <div className="card report-section wide">
              <h3>📅 Year Distribution</h3>
              <div className="report-list">
                {report?.yearDistribution.map(([year, count]) => (
                  <div key={year} className="report-item">
                    <span>{year}</span>
                    <span className="report-count">{count} records</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card report-section">
              <h3>🎯 PESTLE Analysis</h3>
              <div className="report-list">
                {report?.pestleDistribution.map(([pestle, count]) => (
                  <div key={pestle} className="report-item">
                    <span>{pestle}</span>
                    <span className="report-count">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card report-section">
              <h3>📰 Top Sources</h3>
              <div className="report-list">
                {report?.topSources.map(([source, count]) => (
                  <div key={source} className="report-item">
                    <span className="source-name">{source}</span>
                    <span className="report-count">{count}</span>
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

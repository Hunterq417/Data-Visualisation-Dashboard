import React, { useState } from 'react'
import { Sidebar, Topbar } from '../components/Shell'
import { useData } from '../../context/DataContext'

export default function DataExplorer({ setTheme }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { records, meta, loading, filters, applyFilters } = useData()
  const [selectedFilters, setSelectedFilters] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  const onThemeToggle = () => setTheme(document.documentElement.classList.contains('light') ? 'dark' : 'light')
  const onLogout = () => {
    localStorage.removeItem('auth')
    location.href = '/login'
  }

  React.useEffect(() => {
    document.body.classList.toggle('mobile-open', mobileOpen)
    return () => document.body.classList.remove('mobile-open')
  }, [mobileOpen])

  const handleFilterChange = (key, value) => {
    const newFilters = { ...selectedFilters }
    if (value) {
      newFilters[key] = value
    } else {
      delete newFilters[key]
    }
    setSelectedFilters(newFilters)
    applyFilters(newFilters)
    setCurrentPage(1)
  }

  const filteredRecords = records.filter(record => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      record.title?.toLowerCase().includes(query) ||
      record.topic?.toLowerCase().includes(query) ||
      record.sector?.toLowerCase().includes(query) ||
      record.country?.toLowerCase().includes(query) ||
      record.region?.toLowerCase().includes(query)
    )
  })

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage)
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main">
        <Topbar onThemeToggle={onThemeToggle} onLogout={onLogout} onMenu={() => setMobileOpen(true)} />
        <main className="content">
          <div className="page-header">
            <h1>Data Explorer</h1>
            <p className="muted">Browse and filter {records.length} records</p>
          </div>

          <div className="explorer-container">
            <div className="card filters-card">
              <h3>Filters</h3>
              <div className="filters-grid">
                <div className="filter-group">
                  <label>Search</label>
                  <input
                    type="text"
                    placeholder="Search records..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="filter-input"
                  />
                </div>

                {meta?.sector && (
                  <div className="filter-group">
                    <label>Sector</label>
                    <select
                      value={selectedFilters.sector || ''}
                      onChange={(e) => handleFilterChange('sector', e.target.value)}
                      className="filter-select"
                    >
                      <option value="">All Sectors</option>
                      {meta.sector.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                )}

                {meta?.region && (
                  <div className="filter-group">
                    <label>Region</label>
                    <select
                      value={selectedFilters.region || ''}
                      onChange={(e) => handleFilterChange('region', e.target.value)}
                      className="filter-select"
                    >
                      <option value="">All Regions</option>
                      {meta.region.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                )}

                {meta?.topic && (
                  <div className="filter-group">
                    <label>Topic</label>
                    <select
                      value={selectedFilters.topic || ''}
                      onChange={(e) => handleFilterChange('topic', e.target.value)}
                      className="filter-select"
                    >
                      <option value="">All Topics</option>
                      {meta.topic.slice(0, 50).map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                )}

                {meta?.country && (
                  <div className="filter-group">
                    <label>Country</label>
                    <select
                      value={selectedFilters.country || ''}
                      onChange={(e) => handleFilterChange('country', e.target.value)}
                      className="filter-select"
                    >
                      <option value="">All Countries</option>
                      {meta.country.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                )}

                {Object.keys(selectedFilters).length > 0 && (
                  <button
                    onClick={() => {
                      setSelectedFilters({})
                      applyFilters({})
                      setSearchQuery('')
                    }}
                    className="btn small"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            <div className="card data-table-card">
              <div className="table-header">
                <h3>Records ({filteredRecords.length})</h3>
                <div className="pagination">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="btn small"
                  >
                    Previous
                  </button>
                  <span className="page-info">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="btn small"
                  >
                    Next
                  </button>
                </div>
              </div>

              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <div className="spinner"></div>
                  <p className="muted" style={{ marginTop: '12px' }}>Loading data...</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Topic</th>
                        <th>Sector</th>
                        <th>Region</th>
                        <th>Country</th>
                        <th>Intensity</th>
                        <th>Likelihood</th>
                        <th>Relevance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedRecords.map((record, i) => (
                        <tr key={record._id || i}>
                          <td className="title-cell">{record.title || 'N/A'}</td>
                          <td>{record.topic || '-'}</td>
                          <td>{record.sector || '-'}</td>
                          <td>{record.region || '-'}</td>
                          <td>{record.country || '-'}</td>
                          <td>
                            {record.intensity ? (
                              <span className="badge-intensity">{record.intensity}</span>
                            ) : '-'}
                          </td>
                          <td>
                            {record.likelihood ? (
                              <span className="badge-likelihood">{record.likelihood}</span>
                            ) : '-'}
                          </td>
                          <td>
                            {record.relevance ? (
                              <span className="badge-relevance">{record.relevance}</span>
                            ) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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

import React from 'react'
import { Sidebar, Topbar } from '../components/Shell'
import Gauge from '../components/Gauge'
import { DailySalesLine, RevExpBar, ChannelsDoughnut, SectorDistribution, IntensityByYear, RegionDistribution } from '../components/Charts'
import { StatCard } from '../components/StatCard'
import api from '../../services/api'

export default function Dashboard(){
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [records, setRecords] = React.useState([])
  const [meta, setMeta] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [stats, setStats] = React.useState({
    totalRecords: 0,
    avgIntensity: 0,
    avgLikelihood: 0,
    avgRelevance: 0
  })
  
  const onLogout = async ()=>{ 
    try {
      await api.logout()
    } catch (err) {
      console.error('Logout error:', err)
    }
    localStorage.removeItem('auth')
    location.href = '/login'
  }

  React.useEffect(()=>{
    document.body.classList.toggle('mobile-open', mobileOpen)
    return ()=> document.body.classList.remove('mobile-open')
  }, [mobileOpen])

  React.useEffect(()=>{
    const fetchData = async () => {
      try {
        const [recordsData, metaData] = await Promise.all([
          api.getRecords({ limit: 100 }),
          api.getRecordsMeta()
        ])
        
        setRecords(recordsData.items || [])
        setMeta(metaData)
        
        const items = recordsData.items || []
        const validIntensity = items.filter(r => r.intensity != null)
        const validLikelihood = items.filter(r => r.likelihood != null)
        const validRelevance = items.filter(r => r.relevance != null)
        
        setStats({
          totalRecords: recordsData.total || 0,
          avgIntensity: validIntensity.length > 0 
            ? (validIntensity.reduce((sum, r) => sum + r.intensity, 0) / validIntensity.length).toFixed(1)
            : 0,
          avgLikelihood: validLikelihood.length > 0
            ? (validLikelihood.reduce((sum, r) => sum + r.likelihood, 0) / validLikelihood.length).toFixed(1)
            : 0,
          avgRelevance: validRelevance.length > 0
            ? (validRelevance.reduce((sum, r) => sum + r.relevance, 0) / validRelevance.length).toFixed(1)
            : 0
        })
      } catch (err) {
        console.error('Failed to fetch data:', err)
        if (err.message.includes('Unauthorized')) {
          localStorage.removeItem('auth')
          location.href = '/login'
        }
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="dashboard">
        <Sidebar />
        <div className="main">
          <Topbar onLogout={onLogout} onMenu={()=>setMobileOpen(true)} />
          <main className="content" style={{display:'grid',placeItems:'center',minHeight:'60vh'}}>
            <div style={{textAlign:'center'}}>
              <div className="spinner"></div>
              <p className="muted" style={{marginTop:'12px'}}>Loading data...</p>
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
        <Topbar onLogout={onLogout} onMenu={()=>setMobileOpen(true)} />
        <main className="content grid">
          <section className="card hero">
            <div className="hero-body">
              <h3>Data Analytics Dashboard</h3>
              <p className="muted">Real-time insights from {stats.totalRecords} records</p>
              <div className="stats-row">
                <div className="chip"><span>{stats.totalRecords}</span> Total Records</div>
                <div className="chip"><span>{stats.avgIntensity}</span> Avg Intensity</div>
                <div className="chip"><span>{stats.avgLikelihood}</span> Avg Likelihood</div>
                <div className="chip"><span>{stats.avgRelevance}</span> Avg Relevance</div>
              </div>
            </div>
            <div className="hero-visual"><div className="blob" /></div>
          </section>

          <StatCard title="Intensity" value={stats.avgIntensity} delta="Avg" color="var(--success)" />
          <StatCard title="Likelihood" value={stats.avgLikelihood} delta="Avg" />
          <StatCard title="Relevance" value={stats.avgRelevance} delta="Avg" color="var(--orange)" />
          
          <section className="card">
            <h4>Data Insights</h4>
            <div className="mini-metrics">
              <div className="mini">
                <div className="mini-title">Unique Countries</div>
                <div className="mini-value">{meta?.country?.length || 0}</div>
              </div>
              <div className="mini">
                <div className="mini-title">Unique Topics</div>
                <div className="mini-value">{meta?.topic?.length || 0}</div>
              </div>
              <div className="mini">
                <div className="mini-title">Year Range</div>
                <div className="mini-value">{meta?.year?.length || 0} years</div>
              </div>
            </div>
          </section>

          <section className="card">
            <h4>Intensity Trends by Year</h4>
            <p className="muted">Average intensity across years</p>
            <div className="chart-wrap"><IntensityByYear records={records} /></div>
          </section>

          <section className="card">
            <h4>Top Sectors</h4>
            <p className="muted">Distribution of records by sector</p>
            <div className="chart-wrap"><SectorDistribution records={records} /></div>
          </section>

          <section className="card">
            <h4>Regional Distribution</h4>
            <p className="muted">Records count by region</p>
            <div className="chart-wrap"><RegionDistribution records={records} /></div>
          </section>

          <section className="card">
            <h4>Sample Analytics</h4>
            <p className="muted">Revenue vs Expense Trends</p>
            <div className="chart-wrap"><RevExpBar /></div>
          </section>

          <section className="card wide">
            <h4>Recent Records</h4>
            <p className="muted">Sample data from seeded records</p>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Sector</th>
                    <th>Country</th>
                    <th>Intensity</th>
                    <th>Likelihood</th>
                  </tr>
                </thead>
                <tbody>
                  {records.slice(0, 5).map((record, index) => (
                    <tr key={index}>
                      <td className="title-cell">{record.title}</td>
                      <td>{record.sector || 'N/A'}</td>
                      <td>{record.country || 'N/A'}</td>
                      <td>{record.intensity || 'N/A'}</td>
                      <td>{record.likelihood || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mini-metrics">
              <div className="mini"><div className="mini-title">Total Records</div><div className="mini-value">{stats.totalRecords}</div></div>
              <div className="mini"><div className="mini-title">Data Quality</div><div className="mini-value">95%</div></div>
              <div className="mini"><div className="mini-title">Last Updated</div><div className="mini-value">Now</div></div>
            </div>
          </section>

          <section className="card">
            <h4>Support Tracker</h4>
            <p className="muted">Last 7 Days</p>
            <div className="support-grid">
              <div>
                <div className="kpi big">164</div>
                <div className="muted">Total Tickets</div>
                <ul className="list">
                  <li><span className="dot purple"></span>New Tickets <b>142</b></li>
                  <li><span className="dot teal"></span>Open Tickets <b>28</b></li>
                  <li><span className="dot orange"></span>Response Time <b>1 Day</b></li>
                </ul>
              </div>
              <div className="gauge-wrap">
                <Gauge value={85} />
                <a className="btn primary" href="#">Buy Now</a>
              </div>
            </div>
          </section>
        </main>
      </div>
      {mobileOpen && <div className="backdrop" onClick={()=>setMobileOpen(false)} />}
    </div>
  )
}

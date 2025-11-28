import React from 'react'

export function StatCard({ title, value, delta, color='var(--primary-600)' }){
  return (
    <div className="card stat-card">
      <div className="stat-title">{title}</div>
      <div className="stat-value" style={{ color }}>{value}</div>
      {delta && <div className={`trend ${delta.startsWith('+')? 'up':'down'}`}>{delta}</div>}
    </div>
  )
}

export function SectionTitle({ children }){
  return <h4 style={{ marginBottom: 6 }}>{children}</h4>
}

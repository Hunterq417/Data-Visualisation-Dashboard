import React from 'react'

export default function Gauge({ value=85 }){
  const v = Math.max(0, Math.min(100, value))
  const style = { ['--p']: (v/100) }
  return (
    <div className="gauge" style={style}>
      <div className="gauge-center">
        <div className="gauge-num">{v}%</div>
        <div className="muted small">Completed Task</div>
      </div>
    </div>
  )
}

import React from 'react'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend)

const css = (v)=> getComputedStyle(document.documentElement).getPropertyValue(v).trim()

export function DailySalesLine(){
  const data = {
    labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    datasets:[{
      data:[12,18,14,22,19,27,24],
      borderColor: css('--success'),
      backgroundColor: (ctx)=>{
        const g = ctx.chart.ctx.createLinearGradient(0,0,0,160)
        g.addColorStop(0, css('--success') + '80')
        g.addColorStop(1, 'transparent')
        return g
      },
      fill:true, tension:.35, pointRadius:0
    }]
  }
  const options = {
    plugins:{ legend:{ display:false }, tooltip:{ callbacks:{ label: ctx => `$${ctx.formattedValue}k` } } },
    scales:{ x:{ grid:{ display:false }, ticks:{ color: css('--muted') } }, y:{ grid:{ color: css('--border') }, ticks:{ color: css('--muted') } } },
    elements:{ line:{ borderWidth:3 } }
  }
  return <Line data={data} options={options} height={120} />
}

export function RevExpBar(){
  const data = {
    labels:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep'],
    datasets:[
      { label:'Revenue', data:[12,14,16,18,22,19,24,26,28], backgroundColor: css('--primary-600') },
      { label:'Expense', data:[7,8,9,10,12,11,13,12,15], backgroundColor: css('--teal') }
    ]
  }
  const options = { 
    plugins:{ legend:{ labels:{ color: css('--muted') } }, tooltip:{ callbacks:{ label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y}k` } } }, 
    scales:{ x:{ grid:{ display:false }, ticks:{ color: css('--muted') } }, y:{ grid:{ color: css('--border') }, ticks:{ color: css('--muted') } } },
    elements:{ bar:{ borderRadius:8 } }
  }
  return <Bar data={data} options={options} height={160} />
}

export function ChannelsDoughnut(){
  const data = {
    labels:['Organic','Paid','Referral','Email'],
    datasets:[{
      data:[42,26,18,14],
      backgroundColor:[ css('--primary-600'), css('--teal'), css('--orange'), '#64748b' ],
      borderWidth:0
    }]
  }
  const options = { plugins:{ legend:{ position:'bottom', labels:{ color: css('--muted') } } } }
  return <Doughnut data={data} options={options} height={160} />
}

export function SectorDistribution({ records }) {
  const sectorCounts = records.reduce((acc, record) => {
    const sector = record.sector || 'Unknown'
    acc[sector] = (acc[sector] || 0) + 1
    return acc
  }, {})
  
  const topSectors = Object.entries(sectorCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([sector]) => sector)
  
  const data = {
    labels: topSectors,
    datasets: [{
      data: topSectors.map(sector => sectorCounts[sector]),
      backgroundColor: [css('--primary-600'), css('--teal'), css('--orange'), '#64748b', '#8b5cf6'],
      borderWidth: 0
    }]
  }
  
  const options = { 
    plugins: { 
      legend: { 
        position: 'bottom', 
        labels: { color: css('--muted') } 
      } 
    } 
  }
  
  return <Doughnut data={data} options={options} height={160} />
}

export function IntensityByYear({ records }) {
  const yearIntensity = records.reduce((acc, record) => {
    if (record.year && record.intensity != null) {
      if (!acc[record.year]) acc[record.year] = []
      acc[record.year].push(record.intensity)
    }
    return acc
  }, {})
  
  const years = Object.keys(yearIntensity).sort()
  const avgIntensity = years.map(year => {
    const intensities = yearIntensity[year]
    return intensities.reduce((sum, val) => sum + val, 0) / intensities.length
  })
  
  const data = {
    labels: years,
    datasets: [{
      label: 'Average Intensity',
      data: avgIntensity,
      borderColor: css('--success'),
      backgroundColor: (ctx) => {
        const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 160)
        g.addColorStop(0, css('--success') + '80')
        g.addColorStop(1, 'transparent')
        return g
      },
      fill: true,
      tension: 0.35,
      pointRadius: 4
    }]
  }
  
  const options = {
    plugins: { 
      legend: { display: false }, 
      tooltip: { 
        callbacks: { 
          label: ctx => `Intensity: ${ctx.formattedValue}` 
        } 
      } 
    },
    scales: { 
      x: { 
        grid: { display: false }, 
        ticks: { color: css('--muted') } 
      }, 
      y: { 
        grid: { color: css('--border') }, 
        ticks: { color: css('--muted') } 
      } 
    },
    elements: { line: { borderWidth: 3 } }
  }
  
  return <Line data={data} options={options} height={120} />
}

export function RegionDistribution({ records }) {
  const regionCounts = records.reduce((acc, record) => {
    const region = record.region || 'Unknown'
    acc[region] = (acc[region] || 0) + 1
    return acc
  }, {})
  
  const topRegions = Object.entries(regionCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 6)
    .map(([region]) => region)
  
  const data = {
    labels: topRegions,
    datasets: [{
      label: 'Records Count',
      data: topRegions.map(region => regionCounts[region]),
      backgroundColor: css('--primary-600'),
      borderRadius: 8
    }]
  }
  
  const options = { 
    plugins: { 
      legend: { display: false } 
    }, 
    scales: { 
      x: { 
        grid: { display: false }, 
        ticks: { color: css('--muted') } 
      }, 
      y: { 
        grid: { color: css('--border') }, 
        ticks: { color: css('--muted') } 
      } 
    },
    elements: { bar: { borderRadius: 8 } }
  }
  
  return <Bar data={data} options={options} height={160} />
}

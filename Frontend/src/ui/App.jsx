import React, { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { DataProvider } from '../context/DataContext'
import { ThemeProvider } from '../context/ThemeContext'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import DataExplorer from './pages/DataExplorer'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Help from './pages/Help'

function useInitTheme() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light'
    const root = document.documentElement
    if (savedTheme === 'light') {
      root.classList.add('light')
      root.classList.remove('dark')
    } else {
      root.classList.add('dark')
      root.classList.remove('light')
    }
  }, [])
}

export default function App() {
  useInitTheme()
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={
          <DataProvider>
            <Dashboard />
          </DataProvider>
        } />
        <Route path="/analytics" element={
          <DataProvider>
            <Analytics />
          </DataProvider>
        } />
        <Route path="/explorer" element={
          <DataProvider>
            <DataExplorer />
          </DataProvider>
        } />
        <Route path="/reports" element={
          <DataProvider>
            <Reports />
          </DataProvider>
        } />
        <Route path="/help" element={
          <Help />
        } />
        <Route path="/settings" element={
          <Settings />
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  )
}

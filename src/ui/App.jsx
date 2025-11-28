import React, { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { DataProvider } from '../context/DataContext'
import { ThemeProvider } from '../context/ThemeContext'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import DataExplorer from './pages/DataExplorer'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Help from './pages/Help'

function useInitTheme(){
  useEffect(()=>{
    const savedTheme = localStorage.getItem('theme') || 'light'
    const root = document.documentElement
    if(savedTheme === 'light') {
      root.classList.add('light')
      root.classList.remove('dark')
    } else {
      root.classList.add('dark')
      root.classList.remove('light')
    }
  }, [])
}

function RequireAuth({ children }){
  const authed = localStorage.getItem('auth') === '1'
  const loc = useLocation()
  if(!authed) return <Navigate to="/login" replace state={{ from: loc }} />
  return children
}

export default function App(){
  useInitTheme()
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={
          <RequireAuth>
            <DataProvider>
              <Dashboard />
            </DataProvider>
          </RequireAuth>
        } />
        <Route path="/analytics" element={
          <RequireAuth>
            <DataProvider>
              <Analytics />
            </DataProvider>
          </RequireAuth>
        } />
        <Route path="/explorer" element={
          <RequireAuth>
            <DataProvider>
              <DataExplorer />
            </DataProvider>
          </RequireAuth>
        } />
        <Route path="/reports" element={
          <RequireAuth>
            <DataProvider>
              <Reports />
            </DataProvider>
          </RequireAuth>
        } />
        <Route path="/help" element={
          <RequireAuth>
            <Help />
          </RequireAuth>
        } />
        <Route path="/settings" element={
          <RequireAuth>
            <Settings />
          </RequireAuth>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  )
}

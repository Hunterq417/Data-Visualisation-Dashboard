import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const DataContext = createContext()

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within DataProvider')
  }
  return context
}

export function DataProvider({ children }) {
  const [records, setRecords] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({})

  const fetchData = async (customFilters = {}) => {
    try {
      setLoading(true)
      const params = { limit: 1000, ...filters, ...customFilters }
      const [recordsData, metaData] = await Promise.all([
        api.getRecords(params),
        meta ? Promise.resolve(meta) : api.getRecordsMeta()
      ])
      
      setRecords(recordsData.items || [])
      if (!meta) setMeta(metaData)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch data:', err)
      setError(err.message)
      if (err.message.includes('Unauthorized')) {
        localStorage.removeItem('auth')
        window.location.href = '/login'
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const applyFilters = (newFilters) => {
    setFilters(newFilters)
    fetchData(newFilters)
  }

  const value = {
    records,
    meta,
    loading,
    error,
    filters,
    applyFilters,
    refetch: fetchData
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

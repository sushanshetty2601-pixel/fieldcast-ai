import { createContext, useContext, useState, useCallback } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [savedActivities, setSavedActivities] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('fieldcast_activities') || '[]')
    } catch {
      return []
    }
  })

  const [userPrefs, setUserPrefs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('fieldcast_prefs') || '{}')
    } catch {
      return {}
    }
  })

  const saveActivity = useCallback((activity) => {
    const entry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...activity,
    }
    setSavedActivities(prev => {
      const updated = [entry, ...prev].slice(0, 50)
      localStorage.setItem('fieldcast_activities', JSON.stringify(updated))
      return updated
    })
    return entry
  }, [])

  const deleteActivity = useCallback((id) => {
    setSavedActivities(prev => {
      const updated = prev.filter(a => a.id !== id)
      localStorage.setItem('fieldcast_activities', JSON.stringify(updated))
      return updated
    })
  }, [])

  const updatePrefs = useCallback((prefs) => {
    setUserPrefs(prev => {
      const updated = { ...prev, ...prefs }
      localStorage.setItem('fieldcast_prefs', JSON.stringify(updated))
      return updated
    })
  }, [])

  return (
    <AppContext.Provider value={{
      savedActivities,
      saveActivity,
      deleteActivity,
      userPrefs,
      updatePrefs,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}

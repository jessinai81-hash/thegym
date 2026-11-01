import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const AppContext = createContext(null)

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable — state still works in memory */
  }
}

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('pulsefit-theme') === 'light' ? 'light' : 'dark'
    } catch {
      return 'dark'
    }
  })
  const [bookings, setBookings] = useState(() => load('pulsefit-bookings', ['c9']))

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark', 'light')
    root.classList.add(theme)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#07090c' : '#f4f6f1')
    try {
      localStorage.setItem('pulsefit-theme', theme)
    } catch {
      /* ignore */
    }
  }, [theme])

  useEffect(() => save('pulsefit-bookings', bookings), [bookings])

  const toggleTheme = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])
  const book = useCallback((id) => setBookings((b) => (b.includes(id) ? b : [...b, id])), [])
  const cancel = useCallback((id) => setBookings((b) => b.filter((x) => x !== id)), [])

  const value = useMemo(
    () => ({ theme, toggleTheme, bookings, book, cancel }),
    [theme, toggleTheme, bookings, book, cancel],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}

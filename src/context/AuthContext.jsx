import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { api } from '../lib/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [state, setState] = useState({ user: null, stats: null, loading: true, error: null })

  const refresh = useCallback(async () => {
    // No hint cookie means never logged in (or logged out): skip the request entirely.
    if (!/(?:^|;\s*)pf_logged_in=1/.test(document.cookie)) {
      setState({ user: null, stats: null, loading: false, error: null })
      return
    }
    setState((s) => ({ ...s, loading: s.user === null, error: null }))
    try {
      const data = await api('/auth/me')
      setState({ user: data.user, stats: data.stats ?? null, loading: false, error: null })
    } catch (error) {
      if (error.status === 401) setState({ user: null, stats: null, loading: false, error: null })
      else setState((s) => ({ ...s, loading: false, error }))
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  // The "just logged out" redirect is one-shot: once you're home, protected pages ask you to log in again.
  const { pathname } = useLocation()
  useEffect(() => {
    if (pathname === '/' && state.loggedOut) setState((s) => ({ ...s, loggedOut: false }))
  }, [pathname, state.loggedOut])

  // Any API call that comes back 401 (e.g. an expired cookie) logs the app out.
  useEffect(() => {
    const onUnauthorized = () => setState({ user: null, stats: null, loading: false, error: null })
    window.addEventListener('pulsefit:unauthorized', onUnauthorized)
    return () => window.removeEventListener('pulsefit:unauthorized', onUnauthorized)
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await api('/auth/login', { method: 'POST', body: { email, password } })
    setState({ user: data.user, stats: data.stats, loading: false, error: null })
    return data.user
  }, [])

  const signup = useCallback(async (payload) => {
    const data = await api('/auth/signup', { method: 'POST', body: payload })
    setState({ user: data.user, stats: data.stats, loading: false, error: null })
    return data.user
  }, [])

  // `loggedOut` tells protected pages to send you home rather than to the login form.
  const logout = useCallback(async () => {
    try {
      await api('/auth/logout', { method: 'POST' })
    } finally {
      setState({ user: null, stats: null, loading: false, error: null, loggedOut: true })
    }
  }, [])

  const value = useMemo(() => ({ ...state, refresh, login, signup, logout }), [state, refresh, login, signup, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

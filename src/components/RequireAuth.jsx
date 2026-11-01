import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import ErrorState from './ErrorState.jsx'
import { PulseMark } from './Logo.jsx'

export default function RequireAuth({ children }) {
  const { user, loading, error, refresh, loggedOut } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <PulseMark className="h-14 w-14 animate-pulse" />
      </div>
    )
  }
  if (error && !user) {
    return (
      <div className="grid min-h-dvh place-items-center p-4">
        <ErrorState error={error} onRetry={refresh} className="w-full max-w-md" />
      </div>
    )
  }
  if (!user) {
    if (loggedOut) return <Navigate to="/" replace /> // you just pressed "Log out"
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return children
}

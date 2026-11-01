import { LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from './Toast.jsx'

// Once logged out, RequireAuth sends you to the landing page.
export default function LogoutButton({ className = '' }) {
  const { logout } = useAuth()
  const toast = useToast()

  const onClick = async () => {
    try {
      await logout()
      toast({ title: 'Logged out', message: 'See you at your next session.', type: 'info' })
    } catch {
      toast({ title: 'Logged out on this device', message: 'We couldn’t reach the server, but you’re signed out here.', type: 'info' })
    }
  }

  return (
    <button
      onClick={onClick}
      aria-label="Log out"
      title="Log out"
      className={`grid h-10 w-10 place-items-center rounded-2xl border hairline text-muted transition hover:bg-fg/5 hover:text-fg ${className}`}
    >
      <LogOut size={17} />
    </button>
  )
}

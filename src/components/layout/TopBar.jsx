import { Link } from 'react-router-dom'
import Logo from '../Logo.jsx'
import ThemeToggle from '../ThemeToggle.jsx'
import LogoutButton from '../LogoutButton.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { firstName, initials } from '../../lib/format.js'

export default function TopBar() {
  const { user } = useAuth()
  return (
    <header className="sticky top-0 z-30 border-b hairline bg-bg/70 px-4 pb-3 pt-[calc(env(safe-area-inset-top,0px)+0.75rem)] backdrop-blur-xl sm:px-6 lg:hidden">
      <div className="flex items-center justify-between gap-2">
        <Logo to="/" size="sm" />
        <div className="flex min-w-0 items-center gap-2">
          <ThemeToggle />
          <LogoutButton />
          <Link
            to="/profile"
            aria-label="Profile"
            className="flex min-w-0 items-center gap-2 rounded-full border hairline py-1 pl-1 pr-3"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-brand font-display text-xs font-bold text-ink">
              {initials(user?.fullName)}
            </span>
            <span className="max-w-[5.5rem] truncate text-sm font-semibold">{firstName(user?.fullName)}</span>
          </Link>
        </div>
      </div>
    </header>
  )
}

import { NavLink, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Flame, Play } from 'lucide-react'
import Logo from '../Logo.jsx'
import ThemeToggle from '../ThemeToggle.jsx'
import LogoutButton from '../LogoutButton.jsx'
import { navItems } from './nav.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { initials } from '../../lib/format.js'
import { membership } from '../../data/mock.js'

export default function Sidebar() {
  const { user, stats } = useAuth()
  const streak = stats?.streak ?? 0
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r hairline bg-surface/40 p-6 backdrop-blur-xl lg:flex">
      <Logo to="/" />

      <nav className="mt-10 flex flex-col gap-1" aria-label="Main">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                isActive ? 'text-fg' : 'text-muted hover:bg-fg/5 hover:text-fg'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-2xl border border-lime/25 bg-lime/10"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon size={19} className={`relative ${isActive ? 'text-lime' : ''}`} />
                <span className="relative">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-4">
        <div className="glass !rounded-2xl p-4">
          <div className="flex items-center gap-2 text-sm">
            <Flame size={18} className={streak > 0 ? 'text-orange-400' : 'text-muted'} />
            <span className="font-display font-semibold">{streak > 0 ? `${streak}-day streak` : 'No streak yet'}</span>
          </div>
          <p className="mt-1 text-xs text-muted">
            {streak > 0 ? 'Train today to keep the fire going.' : 'Finish a workout today to light the fire.'}
          </p>
          <Link to="/workout" className="btn-primary mt-3 w-full !py-2.5">
            <Play size={15} fill="currentColor" /> Start workout
          </Link>
        </div>
        <div className="flex items-center justify-between gap-2">
          <Link to="/profile" className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-brand font-display text-sm font-bold text-ink">
              {initials(user?.fullName)}
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-sm font-semibold">{user?.fullName}</span>
              <span className="block text-xs text-muted">{membership.name}</span>
            </span>
          </Link>
          <div className="flex shrink-0 gap-1.5">
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </div>
    </aside>
  )
}

import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { navItems } from './nav.js'

// Profile lives in the mobile top bar, so the bottom bar keeps five thumb-sized targets.
const mobileItems = navItems.filter((n) => n.to !== '/profile')

export default function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] lg:hidden"
      aria-label="Main"
    >
      <div className="glass mx-auto flex max-w-md items-center justify-between !rounded-[28px] px-2 py-2">
        {mobileItems.map(({ to, label, icon: Icon, featured }) =>
          featured ? (
            <NavLink key={to} to={to} aria-label={label} className="-mt-8">
              {({ isActive }) => (
                <motion.span
                  whileTap={{ scale: 0.9 }}
                  className={`grid h-16 w-16 place-items-center rounded-full bg-gradient-brand text-ink shadow-glow ring-4 ring-bg ${
                    isActive ? 'scale-105' : ''
                  }`}
                >
                  <Icon size={26} strokeWidth={2.4} />
                </motion.span>
              )}
            </NavLink>
          ) : (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `relative flex w-16 flex-col items-center gap-1 rounded-2xl py-1.5 text-[11px] font-medium transition-colors ${
                  isActive ? 'text-lime' : 'text-muted'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="bottom-active"
                      className="absolute inset-0 rounded-2xl bg-lime/10"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <Icon size={21} className="relative" />
                  <span className="relative">{label}</span>
                </>
              )}
            </NavLink>
          ),
        )}
      </div>
    </nav>
  )
}

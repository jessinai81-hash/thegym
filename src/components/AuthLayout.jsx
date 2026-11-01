import { motion } from 'framer-motion'
import Logo from './Logo.jsx'
import ThemeToggle from './ThemeToggle.jsx'

export default function AuthLayout({ eyebrow, title, subtitle, children, footer }) {
  return (
    <div className="relative min-h-dvh overflow-x-clip">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="orb -left-40 -top-32 h-[32rem] w-[32rem] bg-lime/50" />
        <div className="orb -right-40 bottom-0 h-[28rem] w-[28rem] bg-cyan/40" />
        <div className="grid-bg absolute inset-0" />
      </div>

      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-4 pb-4 pt-[calc(env(safe-area-inset-top,0px)+1rem)] sm:px-6">
        <Logo to="/" />
        <ThemeToggle />
      </header>

      <main className="relative mx-auto grid max-w-md px-4 pb-16 pt-6 sm:pt-12">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="glass relative overflow-hidden p-6 sm:p-8"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-lime/20 blur-3xl" />
          <div className="relative">
            {eyebrow && <p className="eyebrow text-lime">{eyebrow}</p>}
            <h1 className="mt-2 text-3xl font-bold">{title}</h1>
            {subtitle && <p className="mt-1.5 text-sm text-muted">{subtitle}</p>}
            <div className="mt-7">{children}</div>
          </div>
        </motion.div>
        {footer && <p className="mt-6 text-center text-sm text-muted">{footer}</p>}
      </main>
    </div>
  )
}

export function Field({ label, icon: Icon, hint, right, ...input }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <span className="flex items-center gap-3 rounded-2xl border hairline bg-fg/[0.04] px-4 py-3 transition focus-within:border-lime/60 focus-within:bg-fg/[0.06] focus-within:shadow-[0_0_0_4px_rgb(var(--lime)/0.12)]">
        {Icon && <Icon size={18} className="shrink-0 text-muted" />}
        <input className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-muted/70" {...input} />
        {right}
      </span>
      {hint && <span className="mt-1.5 block text-xs text-muted">{hint}</span>}
    </label>
  )
}

export function FormError({ message }) {
  if (!message) return null
  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      role="alert"
      className="rounded-2xl border border-orange-400/30 bg-orange-400/10 px-4 py-3 text-sm text-orange-300 [.light_&]:text-orange-700"
    >
      {message}
    </motion.p>
  )
}

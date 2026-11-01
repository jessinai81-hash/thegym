import { motion } from 'framer-motion'
import { AlertTriangle, DatabaseZap, RotateCcw, WifiOff } from 'lucide-react'

const variants = {
  db_unreachable: { icon: DatabaseZap, title: 'Can’t reach the database' },
  db_not_configured: { icon: DatabaseZap, title: 'Database not connected yet' },
  db_not_setup: { icon: DatabaseZap, title: 'Database isn’t set up yet' },
  network: { icon: WifiOff, title: 'Can’t reach the PulseFit server' },
}

/** Friendly full-card error with a retry button. */
export default function ErrorState({ error, onRetry, className = '' }) {
  const v = variants[error?.code] ?? { icon: AlertTriangle, title: 'That didn’t load' }
  const Icon = v.icon
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`glass flex flex-col items-center px-6 py-12 text-center ${className}`}
      role="alert"
    >
      <div className="relative mb-5">
        <div className="absolute inset-0 rounded-full bg-orange-400/20 blur-2xl" />
        <div className="relative grid h-16 w-16 place-items-center rounded-2xl border hairline bg-fg/5 text-orange-400">
          <Icon size={28} />
        </div>
      </div>
      <h3 className="text-lg font-semibold">{v.title}</h3>
      <p className="mt-1.5 max-w-md text-sm text-muted">{error?.message ?? 'Something went wrong. Please try again.'}</p>
      {onRetry && (
        <button className="btn-primary mt-5 !py-2.5" onClick={onRetry}>
          <RotateCcw size={16} /> Try again
        </button>
      )}
    </motion.div>
  )
}

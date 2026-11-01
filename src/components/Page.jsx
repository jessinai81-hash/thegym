import { motion } from 'framer-motion'
import { stagger } from './GlassCard.jsx'

export default function Page({ title, eyebrow, subtitle, actions, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {(title || actions) && (
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
            {title && <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>}
            {subtitle && <p className="mt-1.5 text-muted">{subtitle}</p>}
          </div>
          {actions}
        </header>
      )}
      <motion.div variants={stagger} initial="hidden" animate="show">
        {children}
      </motion.div>
    </motion.div>
  )
}

import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

const styles = {
  success: { icon: CheckCircle2, ring: 'text-lime' },
  error: { icon: AlertTriangle, ring: 'text-orange-400' },
  info: { icon: Info, ring: 'text-cyan' },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const toast = useCallback(
    (opts) => {
      const id = ++idRef.current
      const t = { id, type: 'info', duration: 3500, ...opts }
      setToasts((list) => [...list.slice(-2), t])
      setTimeout(() => dismiss(id), t.duration)
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex flex-col items-center gap-2 px-4 pt-[calc(env(safe-area-inset-top,0px)+1rem)] md:items-end md:pr-6"
        aria-live="polite"
      >
        <AnimatePresence>
          {toasts.map((t) => {
            const { icon: Icon, ring } = styles[t.type] ?? styles.info
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="glass pointer-events-auto flex w-full max-w-sm items-start gap-3 !rounded-2xl p-4"
                role="status"
              >
                <Icon className={`mt-0.5 shrink-0 ${ring}`} size={20} />
                <div className="min-w-0 flex-1">
                  <p className="font-display text-sm font-semibold">{t.title}</p>
                  {t.message && <p className="mt-0.5 text-sm text-muted">{t.message}</p>}
                </div>
                <button onClick={() => dismiss(t.id)} className="text-muted hover:text-fg" aria-label="Dismiss">
                  <X size={16} />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}

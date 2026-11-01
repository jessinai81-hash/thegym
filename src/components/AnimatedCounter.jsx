import { useEffect, useRef, useState } from 'react'
import { animate, useInView } from 'framer-motion'

function format(n, compact, decimals) {
  if (compact && n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (compact && n >= 10_000) return `${(n / 1000).toFixed(1)}K`
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

/** Counts up from 0 to `value` once it scrolls into view. */
export default function AnimatedCounter({ value, duration = 2, suffix = '', compact = false, className = '' }) {
  const decimals = Number.isInteger(value) ? 0 : 1
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v),
    })
    return () => controls.stop()
  }, [inView, value, duration])

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {format(display, compact, decimals)}
      {suffix}
    </span>
  )
}

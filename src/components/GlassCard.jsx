import { motion } from 'framer-motion'

export const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

export default function GlassCard({ children, className = '', hover = true, as = 'div', ...rest }) {
  const Comp = motion[as] ?? motion.div
  return (
    <Comp
      variants={fadeUp}
      whileHover={hover ? { y: -4, transition: { type: 'spring', stiffness: 300, damping: 20 } } : undefined}
      className={`glass relative overflow-hidden p-5 transition-shadow duration-300 ${hover ? 'hover:shadow-glow' : ''} ${className}`}
      {...rest}
    >
      {children}
    </Comp>
  )
}

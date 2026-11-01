import { Link } from 'react-router-dom'

export function PulseMark({ className = 'h-9 w-9' }) {
  return (
    <span className={`relative grid place-items-center rounded-xl bg-gradient-brand shadow-glow ${className}`}>
      <svg viewBox="0 0 64 64" className="h-[70%] w-[70%]" aria-hidden="true">
        <path
          d="M4 34h13l5-13 9 26 6-17 4 4h19"
          fill="none"
          stroke="#07090c"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

export default function Logo({ to = '/', size = 'md' }) {
  const text = size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-lg' : 'text-xl'
  const mark = size === 'lg' ? 'h-11 w-11' : size === 'sm' ? 'h-7 w-7' : 'h-9 w-9'
  return (
    <Link to={to} className="group -my-1.5 inline-flex items-center gap-2.5 py-1.5" aria-label="PulseFit home">
      <PulseMark className={`${mark} transition-transform duration-300 group-hover:rotate-[-6deg] group-hover:scale-105`} />
      <span className={`font-display font-bold tracking-tight ${text}`}>
        <span className="text-gradient">Pulse</span>
        <span className="text-fg">Fit</span>
      </span>
    </Link>
  )
}

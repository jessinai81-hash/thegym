import { Quote } from 'lucide-react'
import GlassCard from './GlassCard.jsx'
import { quotes } from '../data/mock.js'

function quoteOfTheDay() {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((now - start) / 86_400_000)
  return quotes[dayOfYear % quotes.length]
}

export default function QuoteCard({ className = '' }) {
  const q = quoteOfTheDay()
  return (
    <GlassCard className={className}>
      <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-cyan/10 blur-2xl" />
      <p className="eyebrow flex items-center gap-2">
        <Quote size={14} className="text-cyan" /> Quote of the day
      </p>
      <blockquote className="mt-3 font-display text-lg font-medium leading-snug">“{q.text}”</blockquote>
      <p className="mt-2 text-sm text-muted">— {q.author}</p>
    </GlassCard>
  )
}

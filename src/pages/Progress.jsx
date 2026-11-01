import { useState } from 'react'
import { motion } from 'framer-motion'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Medal, TrendingUp, Trophy } from 'lucide-react'
import Page from '../components/Page.jsx'
import GlassCard from '../components/GlassCard.jsx'
import AnimatedCounter from '../components/AnimatedCounter.jsx'
import { personalRecords, strengthHistory } from '../data/mock.js'
import useChartColors from '../lib/chartColors.js'

const lifts = Object.keys(strengthHistory)

const tiers = {
  gold: { label: 'Gold', cls: 'from-yellow-300 to-amber-500', glow: 'shadow-[0_10px_30px_-10px_rgba(250,204,21,0.7)]' },
  silver: { label: 'Silver', cls: 'from-slate-200 to-slate-400', glow: 'shadow-[0_10px_30px_-10px_rgba(203,213,225,0.6)]' },
  bronze: { label: 'Bronze', cls: 'from-orange-300 to-amber-700', glow: 'shadow-[0_10px_30px_-10px_rgba(251,146,60,0.6)]' },
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <div className="glass !rounded-xl px-3 py-2 text-sm">
      <p className="text-muted">Week of {p.week}</p>
      <p className="font-display text-base font-semibold">{p.kg} kg</p>
    </div>
  )
}

export default function Progress() {
  const [lift, setLift] = useState(lifts[0])
  const colors = useChartColors()
  const data = strengthHistory[lift]
  const first = data[0].kg
  const last = data[data.length - 1].kg
  const gain = last - first
  const gainPct = Math.round((gain / first) * 100)

  return (
    <Page eyebrow="Last 16 weeks" title="Progress" subtitle="Every line going up is a promise you kept.">
      <GlassCard hover={false} className="p-5 sm:p-6">
        <div className="no-scrollbar -mx-5 mb-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:px-0" role="tablist" aria-label="Lift">
          {lifts.map((l) => (
            <button
              key={l}
              role="tab"
              aria-selected={l === lift}
              onClick={() => setLift(l)}
              className={`relative shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                l === lift ? 'text-ink' : 'border hairline text-muted hover:text-fg'
              }`}
            >
              {l === lift && (
                <motion.span layoutId="lift-pill" className="absolute inset-0 rounded-full bg-volt" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
              )}
              <span className="relative">{l}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-end gap-x-8 gap-y-3">
          <div>
            <p className="eyebrow">{lift} · top set</p>
            <p className="mt-1 font-display text-4xl font-bold sm:text-5xl">
              <AnimatedCounter key={lift} value={last} duration={1} /> <span className="text-xl text-muted">kg</span>
            </p>
          </div>
          <div className="flex gap-2 pb-1.5">
            <span className="chip text-lime">
              <TrendingUp size={13} /> +{gain} kg
            </span>
            <span className="chip">+{gainPct}% since July</span>
          </div>
        </div>

        <div className="mt-6 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart key={lift} data={data} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="strengthStroke" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#22e4ff" />
                  <stop offset="100%" stopColor="#c6ff3d" />
                </linearGradient>
                <linearGradient id="strengthFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c6ff3d" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#c6ff3d" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="week" axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={24} />
              <YAxis
                axisLine={false}
                tickLine={false}
                width={52}
                domain={[(min) => Math.floor((min - 5) / 5) * 5, (max) => Math.ceil((max + 5) / 5) * 5]}
                tickFormatter={(v) => `${v}`}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: colors.crosshair, strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area
                type="monotone"
                dataKey="kg"
                stroke="url(#strengthStroke)"
                strokeWidth={2.5}
                fill="url(#strengthFill)"
                dot={false}
                activeDot={{ r: 6, fill: '#c6ff3d', stroke: colors.dotRing, strokeWidth: 2 }}
                animationDuration={1400}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <div className="mb-4 mt-10 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Personal records</h2>
        <span className="chip text-muted">
          <Medal size={13} /> {personalRecords.length} PRs
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {personalRecords.map((pr, i) => {
          const t = tiers[pr.tier]
          return (
            <GlassCard key={pr.lift} className="flex items-center gap-4">
              <motion.span
                initial={{ rotate: -30, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.08, type: 'spring', stiffness: 260, damping: 14 }}
                className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${t.cls} ${t.glow} text-black/80`}
              >
                <Trophy size={26} />
              </motion.span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-muted">{pr.lift}</p>
                <p className="font-display text-2xl font-bold">{pr.value}</p>
                <p className="text-xs text-muted">
                  {pr.date} · <span className="text-lime">{pr.delta}</span>
                </p>
              </div>
              <span className="chip self-start text-[11px] text-muted">{t.label}</span>
            </GlassCard>
          )
        })}
      </div>
    </Page>
  )
}

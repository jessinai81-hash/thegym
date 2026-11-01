import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'
import { ArrowRight, CalendarDays, CheckCircle2, Clock, Dumbbell, Flame, Gauge, Layers, Play, Plus, UserRound } from 'lucide-react'
import Page from '../components/Page.jsx'
import GlassCard from '../components/GlassCard.jsx'
import ProgressRing from '../components/ProgressRing.jsx'
import AnimatedCounter from '../components/AnimatedCounter.jsx'
import QuoteCard from '../components/QuoteCard.jsx'
import EmptyState from '../components/EmptyState.jsx'
import ErrorState from '../components/ErrorState.jsx'
import { Skeleton, SkeletonCard } from '../components/Skeleton.jsx'
import useApi from '../hooks/useApi.js'
import useChartColors from '../lib/chartColors.js'
import { plural } from '../lib/format.js'
import { ringFraction, ringPercent } from '../lib/rings.js'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

function goalMessage(rings) {
  const left = rings.workouts.goal - rings.workouts.value
  if (left <= 0) return 'Weekly workout goal smashed. Legend status. 🏆'
  return `You’re ${plural(left, 'workout')} away from hitting this week’s goal.`
}

export default function Dashboard() {
  const { data, error, loading, reload } = useApi('/dashboard')
  const dateLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  if (error) {
    return (
      <Page eyebrow={dateLabel} title={greeting()}>
        <ErrorState error={error} onRetry={reload} />
      </Page>
    )
  }

  if (loading || !data) return <DashboardSkeleton dateLabel={dateLabel} />

  return (
    <Page
      eyebrow={dateLabel}
      title={
        <>
          {greeting()}, <span className="text-gradient">{data.firstName}</span>
        </>
      }
      subtitle={goalMessage(data.rings)}
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <TodayCard today={data.today} />
        <StreakCard streak={data.streak} activity={data.activity} />
        <RingsCard rings={data.rings} />
        <QuoteCard />
        <ActivityCard activity={data.activity} trend={data.activityTrend} />
        <NextClassCard nextClass={data.nextClass} />
      </div>
    </Page>
  )
}

function DashboardSkeleton({ dateLabel }) {
  return (
    <Page eyebrow={dateLabel} title={greeting()} subtitle="Loading your week…">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SkeletonCard className="lg:col-span-2">
          <Skeleton className="h-6 w-36 rounded-full" />
          <Skeleton className="mt-4 h-10 w-2/3" />
          <Skeleton className="mt-3 h-4 w-1/2" />
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 rounded-2xl" />
            ))}
          </div>
        </SkeletonCard>
        <SkeletonCard>
          <Skeleton className="h-4 w-28" />
          <div className="mt-5 flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-2xl" />
            <Skeleton className="h-12 w-20" />
          </div>
          <Skeleton className="mt-10 h-8 w-full rounded-full" />
        </SkeletonCard>
        <SkeletonCard className="lg:col-span-2">
          <Skeleton className="h-4 w-24" />
          <div className="mt-6 grid grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="mx-auto aspect-square w-full max-w-[132px] !rounded-full" />
            ))}
          </div>
        </SkeletonCard>
        <SkeletonCard>
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-4 h-5 w-full" />
          <Skeleton className="mt-2 h-5 w-3/4" />
        </SkeletonCard>
        <SkeletonCard className="lg:col-span-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-3 h-8 w-48" />
          <Skeleton className="mt-6 h-48 w-full" />
        </SkeletonCard>
        <SkeletonCard>
          <Skeleton className="h-4 w-28" />
          <div className="mt-5 flex gap-4">
            <Skeleton className="h-16 w-16 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </SkeletonCard>
      </div>
    </Page>
  )
}

function TodayCard({ today }) {
  if (!today || today.exercises.length === 0) {
    return (
      <div className="lg:col-span-2">
        <EmptyState
          icon={Dumbbell}
          title="No workout yet today."
          message="Pick one from the Library! Add a few exercises and your plan for today builds itself."
          action={
            <Link to="/library" className="btn-primary !py-2.5">
              <Plus size={16} /> Open the Library
            </Link>
          }
        />
      </div>
    )
  }

  const done = today.status === 'completed'
  const shown = today.exercises.slice(0, 6)
  return (
    <GlassCard className="p-6 lg:col-span-2" hover={false}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-lime/15 via-transparent to-cyan/10" />
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-lime/20 blur-3xl" />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="chip text-lime">
            {done ? <CheckCircle2 size={13} /> : <Dumbbell size={13} />} {done ? 'Completed today' : 'Today’s workout'}
          </span>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">{today.name}</h2>
          <p className="mt-1 text-muted">{today.muscleGroups.join(' · ') || 'Custom session'}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <span className="chip">
              <Clock size={13} /> {done ? `${today.durationMinutes} min` : `~${today.estimatedMinutes} min`}
            </span>
            <span className="chip">
              <Layers size={13} className="text-cyan" /> {today.doneSets}/{today.totalSets} sets
            </span>
            <span className="chip">{plural(today.exercises.length, 'exercise')}</span>
          </div>
        </div>
        {done ? (
          <Link to="/library" className="btn-ghost group shrink-0 !px-6 !py-4 !text-base">
            <Plus size={18} /> Add another
          </Link>
        ) : (
          <Link to="/workout" className="btn-primary group shrink-0 !px-7 !py-4 !text-base">
            <Play size={18} fill="currentColor" /> {today.status === 'in_progress' ? 'Continue' : 'Start'}
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>
      <ol className="relative mt-6 grid gap-2 sm:grid-cols-2">
        {shown.map((e, i) => (
          <li key={e.id} className="flex items-center gap-3 rounded-2xl border hairline bg-fg/[0.03] px-4 py-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-fg/5 font-display text-sm font-semibold text-lime">
              {i + 1}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{e.name}</p>
              <p className="text-xs text-muted">
                {e.sets} × {e.reps}
              </p>
            </div>
          </li>
        ))}
      </ol>
      {today.exercises.length > shown.length && (
        <p className="relative mt-3 text-sm text-muted">+{today.exercises.length - shown.length} more</p>
      )}
    </GlassCard>
  )
}

function StreakCard({ streak, activity }) {
  const todayIndex = activity.length - 1
  return (
    <GlassCard className="flex flex-col p-6">
      <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-orange-500/20 blur-3xl" />
      <p className="eyebrow">Current streak</p>
      <div className="mt-4 flex items-center gap-4">
        <motion.span
          animate={streak.current > 0 ? { scale: [1, 1.12, 1], rotate: [0, -4, 4, 0] } : {}}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className={`grid h-16 w-16 place-items-center rounded-2xl text-white ${
            streak.current > 0
              ? 'bg-gradient-to-br from-orange-400 to-rose-500 shadow-[0_10px_40px_-10px_rgba(251,146,60,0.8)]'
              : 'bg-fg/10 text-muted'
          }`}
        >
          <Flame size={32} fill="currentColor" />
        </motion.span>
        <div>
          <p className="font-display text-5xl font-bold leading-none" data-testid="streak-count">
            <AnimatedCounter value={streak.current} duration={1.2} />
          </p>
          <p className="text-sm text-muted">{streak.current === 1 ? 'day in a row' : 'days in a row'}</p>
        </div>
      </div>
      <div className="mt-auto pt-6">
        <div className="flex justify-between">
          {activity.map((d, i) => {
            const done = d.workouts > 0
            const isToday = i === todayIndex
            return (
              <div key={d.date} className="flex flex-col items-center gap-1.5" title={`${d.day}: ${done ? `${d.minutes} min` : 'rest'}`}>
                <span
                  className={`grid h-8 w-8 place-items-center rounded-full text-[11px] font-semibold ${
                    done ? 'bg-gradient-brand text-ink' : isToday ? 'border-2 border-dashed border-lime/60 text-lime' : 'bg-fg/5 text-muted'
                  }`}
                >
                  {done ? '✓' : d.day[0]}
                </span>
              </div>
            )
          })}
        </div>
        <p className="mt-3 text-xs text-muted">
          {streak.current === 0 ? 'Finish a workout today to start a streak.' : `Best streak: ${plural(streak.best, 'day')}`}
        </p>
      </div>
    </GlassCard>
  )
}

function RingsCard({ rings }) {
  const list = [
    { ...rings.workouts, label: 'Workouts', unit: '', from: '#c6ff3d', to: '#8bff6b' },
    { ...rings.minutes, label: 'Active min', unit: 'min', from: '#22e4ff', to: '#5b8cff' },
    { ...rings.goals, label: 'Goals hit', unit: '', from: '#c6ff3d', to: '#22e4ff' },
  ]
  return (
    <GlassCard className="p-6 lg:col-span-2" hover={false}>
      <div className="flex items-center justify-between">
        <p className="eyebrow">This week</p>
        <Link to="/progress" className="-my-2.5 py-2.5 text-sm text-muted transition hover:text-fg">
          View progress →
        </Link>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2">
        {list.map((r, i) => (
          <div key={r.label} className="flex flex-col items-center text-center">
            <div className="hidden sm:block">
              <ProgressRing value={ringFraction(r.value, r.goal)} size={132} stroke={11} from={r.from} to={r.to} delay={0.3 + i * 0.15}>
                <RingLabel r={r} />
              </ProgressRing>
            </div>
            <div className="sm:hidden">
              <ProgressRing value={ringFraction(r.value, r.goal)} size={96} stroke={9} from={r.from} to={r.to} delay={0.3 + i * 0.15}>
                <RingLabel r={r} small />
              </ProgressRing>
            </div>
            <p className="mt-3 text-sm font-medium">{r.label}</p>
            <p className="text-xs text-muted">
              Goal {r.goal}
              {r.unit && ` ${r.unit}`}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-center text-xs text-muted">Goals: weekly workouts · weekly minutes · trained today</p>
    </GlassCard>
  )
}

function RingLabel({ r, small }) {
  return (
    <div>
      <p className={`font-display font-bold leading-none ${small ? 'text-xl' : 'text-3xl'}`} data-testid="ring-value">
        <AnimatedCounter value={r.value} duration={1.4} />
      </p>
      <p className="mt-1 text-[11px] text-muted" data-testid="ring-percent">
        {ringPercent(r.value, r.goal)}%
      </p>
    </div>
  )
}

function ActivityTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const date = new Date(`${d.date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
  return (
    <div className="glass !rounded-xl px-3 py-2 text-sm">
      <p className="font-display font-semibold">{date}</p>
      {d.workouts > 0 ? (
        <p className="text-muted">
          <span className="font-semibold text-fg">{d.minutes}</span> min · {plural(d.workouts, 'workout')}
        </p>
      ) : (
        <p className="text-muted">Rest day</p>
      )}
    </div>
  )
}

function TrendChip({ trend }) {
  if (!trend.prev7) {
    return trend.last7 ? <span className="chip text-lime">Fresh start. Keep it rolling!</span> : null
  }
  const pct = Math.round(((trend.last7 - trend.prev7) / trend.prev7) * 100)
  return (
    <span className={`chip ${pct >= 0 ? 'text-lime' : 'text-muted'}`}>
      {pct >= 0 ? '+' : ''}
      {pct}% vs previous 7 days
    </span>
  )
}

function ActivityCard({ activity, trend }) {
  const colors = useChartColors()
  const total = activity.reduce((s, d) => s + d.minutes, 0)
  const todayIndex = activity.length - 1
  return (
    <GlassCard className="p-6 lg:col-span-2" hover={false}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="eyebrow">Last 7 days</p>
          <p className="mt-1 font-display text-3xl font-bold" data-testid="activity-total">
            <AnimatedCounter value={total} /> <span className="text-base font-medium text-muted">active minutes</span>
          </p>
        </div>
        <TrendChip trend={trend} />
      </div>
      <div className="relative mt-4 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={activity} margin={{ top: 10, right: 0, left: -24, bottom: 0 }} barCategoryGap="28%">
            <defs>
              <linearGradient id="barToday" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c6ff3d" />
                <stop offset="100%" stopColor="#22e4ff" />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="day" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} width={48} allowDecimals={false} domain={[0, (max) => Math.max(30, max)]} />
            <Tooltip content={<ActivityTooltip />} cursor={{ fill: colors.cursor, radius: 8 }} />
            <Bar dataKey="minutes" radius={[6, 6, 2, 2]} animationDuration={1200} animationBegin={200}>
              {activity.map((d, i) => (
                <Cell key={d.date} fill={i === todayIndex ? 'url(#barToday)' : colors.bar} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        {total === 0 && (
          <p className="pointer-events-none absolute inset-0 grid place-items-center pb-6 text-sm text-muted">
            No active minutes yet. Your first workout will light this up.
          </p>
        )}
      </div>
    </GlassCard>
  )
}

function NextClassCard({ nextClass }) {
  if (!nextClass) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="No upcoming classes"
        message="The schedule for the next few days hasn’t been posted yet. Check back soon!"
      />
    )
  }

  const start = new Date(nextClass.startTime)
  const day = start.toLocaleDateString('en-US', { weekday: 'short' })
  const date = start.getDate()
  const time = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return (
    <GlassCard className="flex flex-col p-6">
      <p className="eyebrow">Next class at the gym</p>
      <div className="mt-4 flex items-start gap-4">
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-fg/5 text-center leading-none">
          <div>
            <p className="text-[11px] uppercase text-muted">{day}</p>
            <p className="mt-1 font-display text-2xl font-bold">{date}</p>
          </div>
        </div>
        <div className="min-w-0">
          <p className="chip text-cyan">
            <Gauge size={12} /> {nextClass.intensity} intensity
          </p>
          <h3 className="mt-2 text-lg font-semibold">{nextClass.title}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
            <Clock size={13} /> {time} · {nextClass.durationMinutes} min
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted">
            <UserRound size={13} /> {nextClass.coachName} · {nextClass.capacity} spots
          </p>
        </div>
      </div>
      <div className="mt-auto pt-5">
        <Link to="/classes" className="btn-ghost w-full !py-2.5">
          See the schedule
        </Link>
      </div>
    </GlassCard>
  )
}

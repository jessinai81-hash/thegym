import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, DatabaseZap, Flame, LogOut, Play, Sparkles, Star, Trophy } from 'lucide-react'
import Logo from '../components/Logo.jsx'
import ThemeToggle from '../components/ThemeToggle.jsx'
import AnimatedCounter from '../components/AnimatedCounter.jsx'
import ProgressRing from '../components/ProgressRing.jsx'
import GlassCard, { fadeUp, stagger } from '../components/GlassCard.jsx'
import { Skeleton } from '../components/Skeleton.jsx'
import Footer from '../components/layout/Footer.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../components/Toast.jsx'
import useApi from '../hooks/useApi.js'
import { firstName, initials } from '../lib/format.js'
import { classTypes, features, testimonials } from '../data/mock.js'
import { getIcon } from '../lib/icons.js'

function useStartPath() {
  const { user } = useAuth()
  return user ? '/dashboard' : '/signup'
}

export default function Landing() {
  const stats = useApi('/stats')
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="relative overflow-x-clip">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="orb -left-40 -top-32 h-[36rem] w-[36rem] bg-lime/50" />
        <div className="orb -right-40 top-40 h-[30rem] w-[30rem] bg-cyan/40" />
        <div className="grid-bg absolute inset-x-0 top-0 h-[60rem]" />
      </div>

      <Nav />
      <Hero members={stats.data?.members} />
      <Stats stats={stats} />
      <Features />
      <ClassesStrip classesThisWeek={stats.data?.classesThisWeek} />
      <Testimonials />
      <CtaBand />
      <Footer wide />
    </motion.div>
  )
}

function Nav() {
  const { user, logout } = useAuth()
  const toast = useToast()
  const onLogout = async () => {
    await logout().catch(() => {})
    toast({ title: 'Logged out', message: 'See you at your next session.', type: 'info' })
  }
  return (
    <header className="sticky top-0 z-40 border-b border-transparent bg-bg/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 pt-[calc(env(safe-area-inset-top,0px)+1rem)] sm:px-6">
        <Logo to="/" />
        <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
          <a href="#features" className="transition hover:text-fg">Features</a>
          <a href="#classes" className="transition hover:text-fg">Classes</a>
          <a href="#stories" className="transition hover:text-fg">Stories</a>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <>
              <Link to="/dashboard" className="btn-ghost !gap-2.5 !py-2 !pl-2 !pr-4" title="Open your dashboard">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-brand font-display text-[11px] font-bold text-ink">
                  {initials(user.fullName)}
                </span>
                <span className="max-w-[7rem] truncate">{firstName(user.fullName)}</span>
              </Link>
              <button onClick={onLogout} className="grid h-10 w-10 place-items-center rounded-2xl border hairline text-muted transition hover:bg-fg/5 hover:text-fg" aria-label="Log out" title="Log out">
                <LogOut size={17} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-2 py-2.5 text-sm font-semibold text-muted transition hover:text-fg sm:px-3">
                Log in
              </Link>
              <Link to="/signup" className="btn-primary !px-4 !py-2.5">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

function Hero({ members }) {
  const startPath = useStartPath()
  return (
    <section className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 pb-16 pt-10 sm:px-6 md:pt-20 lg:grid-cols-[1.1fr_0.9fr]">
      <motion.div variants={stagger} initial="hidden" animate="show">
        <motion.span variants={fadeUp} className="chip border border-lime/30 !bg-lime/10 text-lime">
          <Sparkles size={13} /> New: Live Workout Mode
        </motion.span>
        <motion.h1
          variants={fadeUp}
          className="mt-6 text-[clamp(2.75rem,8vw,5.5rem)] font-bold leading-[0.95] tracking-[-0.04em]"
        >
          Train smarter.
          <br />
          <span className="text-gradient">Get stronger.</span>
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-6 max-w-lg text-lg text-muted">
          PulseFit plans your workouts, tracks every rep, books your classes and keeps your streak alive — all from your
          pocket.
        </motion.p>
        <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
          <Link to={startPath} className="btn-primary group !px-7 !py-4 !text-base">
            <Play size={18} fill="currentColor" />
            Start Your Workout
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
          <Link to="/dashboard" className="btn-ghost !px-6 !py-4 !text-base">
            See my dashboard
          </Link>
        </motion.div>
        <motion.div variants={fadeUp} className="mt-8 flex items-center gap-4">
          <div className="flex -space-x-2">
            {['#c6ff3d', '#22e4ff', '#a78bfa', '#fb923c'].map((c, i) => (
              <span
                key={c}
                className="grid h-9 w-9 place-items-center rounded-full border-2 border-bg font-display text-xs font-bold text-ink"
                style={{ background: c }}
              >
                {['JM', 'KO', 'LT', 'RS'][i]}
              </span>
            ))}
          </div>
          <div className="text-sm">
            <div className="flex items-center gap-0.5 text-lime">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} fill="currentColor" />
              ))}
            </div>
            <span className="text-muted">
              {members ? `Join ${members.toLocaleString('en-US')} member${members === 1 ? '' : 's'} training smarter` : 'Join the PulseFit crew'}
            </span>
          </div>
        </motion.div>
      </motion.div>

      <HeroVisual />
    </section>
  )
}

function HeroVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, rotate: -2 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-sm"
    >
      <div className="absolute inset-6 rounded-[40px] bg-gradient-brand opacity-30 blur-3xl" />
      <div className="glass relative !rounded-[36px] p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow">This week</p>
            <p className="mt-1 font-display text-xl font-semibold">Weekly goal</p>
          </div>
          <span className="chip text-lime">
            <Flame size={13} className="text-orange-400" /> 12 days
          </span>
        </div>

        <div className="my-6 grid place-items-center">
          <ProgressRing value={0.8} size={190} stroke={14} delay={0.8} duration={1.8}>
            <div>
              <p className="font-display text-5xl font-bold">
                <AnimatedCounter value={80} duration={1.8} />
                <span className="text-2xl text-muted">%</span>
              </p>
              <p className="text-xs text-muted">4 of 5 workouts</p>
            </div>
          </ProgressRing>
        </div>

        <div className="rounded-2xl border hairline bg-fg/[0.03] p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Heart rate</span>
            <span className="font-display font-semibold">
              142 <span className="text-xs text-muted">bpm</span>
            </span>
          </div>
          <svg viewBox="0 0 300 60" className="mt-2 h-12 w-full" aria-hidden="true">
            <defs>
              <linearGradient id="hr" x1="0" x2="1">
                <stop offset="0" stopColor="#c6ff3d" />
                <stop offset="1" stopColor="#22e4ff" />
              </linearGradient>
            </defs>
            <path
              d="M0 32 H70 L84 12 L98 52 L112 6 L126 44 L138 32 H190 L204 18 L216 46 L228 32 H300"
              fill="none"
              stroke="url(#hr)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="600"
              className="animate-pulseline"
            />
          </svg>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.1, type: 'spring', stiffness: 200, damping: 20 }}
        className="glass absolute -left-4 top-24 flex animate-float items-center gap-3 !rounded-2xl px-4 py-3 sm:-left-14"
      >
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-yellow-400/15 text-yellow-400">
          <Trophy size={18} />
        </span>
        <div className="leading-tight">
          <p className="text-[11px] text-muted">New PR</p>
          <p className="font-display text-sm font-semibold">Deadlift 162.5 kg</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.35, type: 'spring', stiffness: 200, damping: 20 }}
        className="glass absolute -right-3 bottom-28 animate-float !rounded-2xl px-4 py-3 [animation-delay:1.5s] sm:-right-12"
      >
        <p className="text-[11px] text-muted">Burned today</p>
        <p className="font-display text-lg font-bold text-gradient">612 kcal</p>
      </motion.div>
    </motion.div>
  )
}

const STAT_LABELS = [
  { key: 'members', label: 'Members' },
  { key: 'workoutsCompleted', label: 'Workouts completed' },
  { key: 'classesThisWeek', label: 'Classes this week' },
]

function Stats({ stats }) {
  const { data, error, loading } = stats
  return (
    <section className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-60px' }}
        className="glass grid grid-cols-1 divide-y hairline !rounded-[32px] sm:grid-cols-3 sm:divide-x sm:divide-y-0"
      >
        {STAT_LABELS.map((s) => (
          <motion.div key={s.key} variants={fadeUp} className="hairline p-6 text-center sm:p-8" data-testid={`stat-${s.key}`}>
            <div className="flex h-10 items-center justify-center font-display text-4xl font-bold sm:h-12 sm:text-5xl">
              {loading ? (
                <Skeleton className="h-10 w-28 sm:h-12" />
              ) : data ? (
                <AnimatedCounter value={data[s.key]} compact={data[s.key] > 100000} className="text-gradient" />
              ) : (
                <span className="text-muted/50">—</span>
              )}
            </div>
            <p className="mt-2 text-sm text-muted">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>
      {error && (
        <p className="mt-3 flex items-center justify-center gap-2 text-center text-sm text-muted" role="status">
          <DatabaseZap size={15} className="shrink-0 text-orange-400" />
          Live stats are taking a breather: {error.message}
        </p>
      )}
    </section>
  )
}

function SectionHead({ eyebrow, title, text }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className="mx-auto mb-10 max-w-2xl text-center"
    >
      <p className="eyebrow text-lime">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold sm:text-5xl">{title}</h2>
      {text && <p className="mt-4 text-muted">{text}</p>}
    </motion.div>
  )
}

function Features() {
  return (
    <section id="features" className="relative mx-auto max-w-6xl scroll-mt-24 px-4 py-20 sm:px-6">
      <SectionHead eyebrow="Everything in one app" title="Built for people who show up." text="From your first rep to your next PR, PulseFit keeps the plan simple and the momentum high." />
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-60px' }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {features.map((f, i) => {
          const Icon = getIcon(f.icon)
          return (
            <GlassCard key={f.title} className="p-6">
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-lime/10 blur-2xl" />
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-brand text-ink">
                <Icon size={22} />
              </span>
              <p className="mt-5 font-display text-xs text-muted">0{i + 1}</p>
              <h3 className="mt-1 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted">{f.text}</p>
            </GlassCard>
          )
        })}
      </motion.div>
    </section>
  )
}

function ClassesStrip({ classesThisWeek }) {
  return (
    <section id="classes" className="relative mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6">
      <SectionHead eyebrow={classesThisWeek ? `${classesThisWeek} classes this week` : 'Group classes'} title="Find your crew." />
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-60px' }}
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        {Object.entries(classTypes).map(([name, c]) => (
          <GlassCard key={name} className="flex aspect-[4/5] flex-col justify-end !p-6">
            <div className={`absolute inset-0 bg-gradient-to-br ${c.color}`} />
            <span className="absolute right-5 top-5 font-display text-6xl font-bold text-fg/10">{name[0]}</span>
            <div className="relative">
              <span className={`mb-3 block h-2 w-2 rounded-full ${c.dot}`} />
              <h3 className="text-2xl font-bold">{name}</h3>
              <p className="mt-1 text-sm text-muted">{c.blurb}</p>
            </div>
          </GlassCard>
        ))}
      </motion.div>
      <div className="mt-8 text-center">
        <Link to="/classes" className="btn-ghost">
          Browse the schedule <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  )
}

function Testimonials() {
  return (
    <section id="stories" className="relative mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6">
      <SectionHead eyebrow="Member stories" title="Real people. Real gains." />
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-60px' }}
        className="grid gap-4 md:grid-cols-3"
      >
        {testimonials.map((t) => (
          <GlassCard key={t.name} className="p-6">
            <div className="flex gap-0.5 text-lime">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} fill="currentColor" />
              ))}
            </div>
            <p className="mt-4 text-[15px] leading-relaxed">“{t.text}”</p>
            <div className="mt-5 text-sm">
              <p className="font-semibold">{t.name}</p>
              <p className="text-muted">{t.role}</p>
            </div>
          </GlassCard>
        ))}
      </motion.div>
    </section>
  )
}

function CtaBand() {
  const startPath = useStartPath()
  return (
    <section className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-[36px] bg-gradient-brand px-6 py-14 text-center text-ink sm:px-12"
      >
        <div className="grid-bg absolute inset-0 opacity-60" />
        <div className="relative">
          <h2 className="text-4xl font-bold sm:text-6xl">Your next PR starts now.</h2>
          <p className="mx-auto mt-4 max-w-md text-ink/70">Join PulseFit, pick a plan, and hit start. We’ll handle the counting.</p>
          <Link
            to={startPath}
            className="btn mt-8 bg-ink !px-7 !py-4 !text-base text-white hover:-translate-y-0.5 hover:shadow-2xl"
          >
            <Play size={18} fill="currentColor" /> Start Your Workout
          </Link>
        </div>
      </motion.div>
    </section>
  )
}

import { motion } from 'framer-motion'
import { Award, Bell, ChevronRight, Lock, LogOut, MapPin, Moon, Sparkles } from 'lucide-react'
import Page from '../components/Page.jsx'
import GlassCard from '../components/GlassCard.jsx'
import AnimatedCounter from '../components/AnimatedCounter.jsx'
import ProgressRing from '../components/ProgressRing.jsx'
import ThemeToggle from '../components/ThemeToggle.jsx'
import { PulseMark } from '../components/Logo.jsx'
import { useToast } from '../components/Toast.jsx'
import { useApp } from '../context/AppContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { achievements, membership } from '../data/mock.js'
import { initials } from '../lib/format.js'
import { getIcon } from '../lib/icons.js'

export default function Profile() {
  const { bookings, theme } = useApp()
  const { user, stats: authStats, logout } = useAuth()
  const toast = useToast()
  const earned = achievements.filter((a) => a.earned).length
  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const stats = [
    { label: 'Workouts', value: authStats?.workoutsCompleted ?? 0 },
    { label: 'Day streak', value: authStats?.streak ?? 0 },
    { label: 'Classes', value: bookings.length },
  ]

  const onSignOut = async () => {
    await logout().catch(() => {})
    toast({ title: 'Logged out', message: 'See you at your next session.', type: 'info' })
  }

  return (
    <Page>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <GlassCard hover={false} className="flex flex-col items-center p-8 text-center">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-lime/20 to-transparent" />
          <div className="relative">
            <motion.div
              className="absolute -inset-2 rounded-full bg-gradient-brand opacity-70 blur-md"
              animate={{ opacity: [0.5, 0.85, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <div className="relative rounded-full bg-gradient-brand p-1">
              <div className="grid h-28 w-28 place-items-center rounded-full bg-bg font-display text-4xl font-bold text-gradient">
                {initials(user.fullName)}
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 grid h-9 w-9 place-items-center rounded-full border-4 border-bg bg-volt font-display text-xs font-bold text-ink">
              {membership.level}
            </span>
          </div>
          <h1 className="relative mt-5 text-2xl font-bold">{user.fullName}</h1>
          <p className="relative text-sm text-muted">{user.email}</p>
          <p className="relative mt-2 flex items-center gap-1.5 text-sm text-muted">
            <MapPin size={13} /> {membership.homeGym} · since {memberSince}
          </p>
          <p className="relative mt-1 text-xs text-muted">
            Weekly goal: {user.weeklyGoalWorkouts} workouts · {user.weeklyGoalMinutes} active min
          </p>

          <div className="relative mt-6 w-full">
            <div className="mb-1.5 flex justify-between text-xs">
              <span className="text-muted">Level {membership.level}</span>
              <span className="font-semibold">
                {membership.xp.toLocaleString()} / {membership.xpNext.toLocaleString()} XP
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-fg/10">
              <motion.div
                className="h-full rounded-full bg-gradient-brand"
                initial={{ width: 0 }}
                animate={{ width: `${(membership.xp / membership.xpNext) * 100}%` }}
                transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>

          <div className="relative mt-6 grid w-full grid-cols-3 gap-2">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl bg-fg/5 py-3">
                <p className="font-display text-2xl font-bold">
                  <AnimatedCounter value={s.value} duration={1.2} />
                </p>
                <p className="text-xs text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <div className="space-y-4">
          <MembershipCard name={user.fullName} />

          <GlassCard hover={false} className="!p-2">
            <SettingRow icon={Moon} label="Dark mode" hint={theme === 'dark' ? 'On' : 'Off'} right={<ThemeToggle />} />
            <SettingRow
              icon={Bell}
              label="Workout reminders"
              hint="Coming soon"
              onClick={() => toast({ title: 'Reminders are coming soon', message: 'Daily workout nudges are on the roadmap.', type: 'info' })}
            />
            <SettingRow icon={LogOut} label="Log out" hint={user.email} onClick={onSignOut} />
          </GlassCard>
        </div>
      </div>

      <div className="mb-4 mt-10 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Achievements</h2>
        <span className="chip text-lime">
          <Award size={13} /> {earned}/{achievements.length} unlocked
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {achievements.map((a, i) => (
          <Badge key={a.id} a={a} i={i} />
        ))}
      </div>
    </Page>
  )
}

function MembershipCard({ name }) {
  return (
    <motion.div
      initial={{ opacity: 0, rotateX: 20, y: 20 }}
      animate={{ opacity: 1, rotateX: 0, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, rotate: -0.5 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-brand p-6 text-ink shadow-glow"
      style={{ perspective: 800 }}
    >
      <div className="grid-bg absolute inset-0 opacity-50" />
      <motion.div
        className="absolute -inset-y-10 w-24 rotate-12 bg-white/40 blur-xl"
        initial={{ x: '-150%' }}
        animate={{ x: '900%' }}
        transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/60">Membership</p>
          <p className="mt-1 flex items-center gap-2 font-display text-2xl font-bold">
            {membership.name} <Sparkles size={18} />
          </p>
        </div>
        <PulseMark className="h-10 w-10 !bg-ink !bg-none !shadow-none [&_path]:stroke-[#c6ff3d]" />
      </div>
      <div className="relative mt-10 flex items-end justify-between">
        <div>
          <p className="text-xs text-ink/60">Member</p>
          <p className="font-display font-semibold">{name}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-ink/60">Renews</p>
          <p className="font-display font-semibold">Mar 2027</p>
        </div>
      </div>
      <ul className="relative mt-5 flex flex-wrap gap-2 text-xs font-medium">
        {['All classes', 'Guest passes ×4', 'Recovery lounge'].map((p) => (
          <li key={p} className="rounded-full bg-ink/10 px-3 py-1">
            {p}
          </li>
        ))}
      </ul>
    </motion.div>
  )
}

function SettingRow({ icon: Icon, label, hint, right, onClick }) {
  const Comp = onClick ? 'button' : 'div'
  return (
    <Comp onClick={onClick} className="flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left transition hover:bg-fg/5">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-fg/5 text-lime">
        <Icon size={18} />
      </span>
      <span className="flex-1">
        <span className="block text-sm font-medium">{label}</span>
        {hint && <span className="block text-xs text-muted">{hint}</span>}
      </span>
      {right ?? <ChevronRight size={18} className="text-muted" />}
    </Comp>
  )
}

function Badge({ a, i }) {
  const Icon = getIcon(a.icon)
  return (
    <GlassCard className={`flex flex-col items-center p-5 text-center ${a.earned ? '' : 'opacity-80'}`}>
      {a.earned ? (
        <motion.span
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2 + i * 0.06, type: 'spring', stiffness: 260, damping: 14 }}
          className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-brand text-ink shadow-glow"
        >
          <Icon size={28} />
        </motion.span>
      ) : (
        <ProgressRing value={a.progress} size={64} stroke={5} delay={0.4 + i * 0.06}>
          <Lock size={18} className="text-muted" />
        </ProgressRing>
      )}
      <p className="mt-4 font-display font-semibold">{a.name}</p>
      <p className="mt-1 text-xs text-muted">{a.desc}</p>
      {!a.earned && <p className="mt-2 text-xs font-semibold text-lime">{Math.round(a.progress * 100)}%</p>}
    </GlassCard>
  )
}

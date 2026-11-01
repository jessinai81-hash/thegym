import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Check, Clock, Dumbbell, Flag, Layers, Loader2, Pause, Play, Plus, RotateCcw, SkipForward, Timer, Trophy, X } from 'lucide-react'
import Page from '../components/Page.jsx'
import GlassCard from '../components/GlassCard.jsx'
import EmptyState from '../components/EmptyState.jsx'
import ErrorState from '../components/ErrorState.jsx'
import { Skeleton, SkeletonCard } from '../components/Skeleton.jsx'
import { useToast } from '../components/Toast.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import useApi from '../hooks/useApi.js'
import useCountdown from '../hooks/useCountdown.js'
import useUnsavedWarning from '../hooks/useUnsavedWarning.js'
import { api } from '../lib/api.js'
import { plural } from '../lib/format.js'

const PRESETS = [30, 60, 90, 120]

function fmt(sec) {
  const s = Math.max(0, Math.ceil(sec))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const ss = String(s % 60).padStart(2, '0')
  return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`
}

function celebrate() {
  const colors = ['#c6ff3d', '#22e4ff', '#ffffff', '#a3ff12']
  const end = Date.now() + 1600
  confetti({ particleCount: 140, spread: 90, origin: { y: 0.6 }, colors, scalar: 1.1 })
  ;(function frame() {
    confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors })
    confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors })
    if (Date.now() < end) requestAnimationFrame(frame)
  })()
}

const countSets = (exercises, pred = () => true) =>
  exercises.reduce((n, e) => n + e.setsDetail.filter(pred).length, 0)

export default function LiveWorkout() {
  const { data, error, loading, reload } = useApi('/workouts')

  if (error) {
    return (
      <Page eyebrow="Live workout" title="Live Workout">
        <ErrorState error={error} onRetry={reload} />
      </Page>
    )
  }
  if (loading && !data) return <WorkoutSkeleton />

  const workout = data.workout
  if (!workout || workout.exercises.length === 0) {
    return (
      <Page eyebrow="Live workout" title="Live Workout">
        <EmptyState
          icon={Dumbbell}
          title="No workout yet today."
          message="Pick one from the Library! Add a few exercises, then come back here to crush them."
          action={
            <Link to="/library" className="btn-primary !py-2.5">
              <Plus size={16} /> Open the Library
            </Link>
          }
        />
      </Page>
    )
  }
  if (workout.status === 'completed') return <DoneToday workout={workout} />
  return <Session key={workout.id} initial={workout} onFinished={reload} />
}

function WorkoutSkeleton() {
  return (
    <Page eyebrow="Live workout" title="Loading your session…">
      <Skeleton className="mb-6 h-2.5 w-full rounded-full" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <SkeletonCard className="flex flex-col items-center">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="my-6 aspect-square w-full max-w-[260px] !rounded-full" />
          <Skeleton className="h-16 w-56 rounded-full" />
        </SkeletonCard>
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <SkeletonCard key={i}>
              <Skeleton className="h-3 w-28" />
              <Skeleton className="mt-2 h-6 w-1/2" />
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {[0, 1, 2].map((j) => (
                  <Skeleton key={j} className="h-14 rounded-2xl" />
                ))}
              </div>
            </SkeletonCard>
          ))}
        </div>
      </div>
    </Page>
  )
}

function DoneToday({ workout }) {
  const sets = countSets(workout.exercises, (s) => s.completed)
  return (
    <Page eyebrow="Live workout" title={workout.name}>
      <GlassCard hover={false} className="flex flex-col items-center px-6 py-12 text-center">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-lime/15 to-transparent" />
        <span className="relative grid h-16 w-16 place-items-center rounded-2xl bg-gradient-brand text-ink shadow-glow">
          <Trophy size={30} />
        </span>
        <h2 className="relative mt-5 text-2xl font-bold">Today’s workout is in the books ✅</h2>
        <p className="relative mt-2 text-muted">
          {workout.durationMinutes} min · {plural(sets, 'set')} · {plural(workout.exercises.length, 'exercise')}. Recovery is part of the plan, or go again!
        </p>
        <div className="relative mt-6 flex flex-col gap-2 sm:flex-row">
          <Link to="/dashboard" className="btn-primary">
            Back to dashboard
          </Link>
          <Link to="/library" className="btn-ghost">
            <Plus size={16} /> Start another from the Library
          </Link>
        </div>
      </GlassCard>
    </Page>
  )
}

function Session({ initial, onFinished }) {
  const navigate = useNavigate()
  const toast = useToast()
  const { refresh: refreshAuth } = useAuth()

  const [exercises, setExercises] = useState(initial.exercises)
  const [startedAt, setStartedAt] = useState(() => (initial.startedAt ? new Date(initial.startedAt).getTime() : Date.now()))
  const [elapsed, setElapsed] = useState(0)
  const [restPreset, setRestPreset] = useState(60)
  const [finishing, setFinishing] = useState(false)
  const [confirmEarly, setConfirmEarly] = useState(false)
  const [result, setResult] = useState(null)
  const pendingSaves = useRef(new Set())
  const [savingCount, setSavingCount] = useState(0)
  useUnsavedWarning(savingCount > 0 || finishing)

  const timer = useCountdown(() => {
    toast({ title: 'Rest over — next set!', message: 'Breathe, brace, go.', type: 'success', duration: 2500 })
    navigator.vibrate?.([120, 60, 120])
  })

  // Opening Live Workout starts the clock on the server (no-op if it was already started).
  useEffect(() => {
    if (initial.status !== 'planned') return
    api('/workouts/start', { method: 'POST', body: { workoutId: initial.id } })
      .then((res) => setStartedAt(new Date(res.workout.startedAt).getTime()))
      .catch((err) => toast({ title: 'Couldn’t start the workout clock', message: err.message, type: 'error' }))
  }, [initial.id, initial.status, toast])

  useEffect(() => {
    if (result) return
    const tick = () => setElapsed((Date.now() - startedAt) / 1000)
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [startedAt, result])

  const totalSets = countSets(exercises)
  const doneSets = countSets(exercises, (s) => s.completed)
  const pct = totalSets ? doneSets / totalSets : 0

  const setSetState = (setId, completed) =>
    setExercises((list) =>
      list.map((e) => ({ ...e, setsDetail: e.setsDetail.map((s) => (s.id === setId ? { ...s, completed } : s)) })),
    )

  const toggleSet = (ex, set) => {
    if (finishing || result) return
    const next = !set.completed
    setSetState(set.id, next) // optimistic

    const save = api('/sets', { method: 'PATCH', body: { setId: set.id, completed: next } }).catch((err) => {
      setSetState(set.id, !next)
      toast({ title: 'That set didn’t save', message: err.message, type: 'error' })
      throw err
    })
    pendingSaves.current.add(save)
    setSavingCount((n) => n + 1)
    save
      .finally(() => {
        pendingSaves.current.delete(save)
        setSavingCount((n) => n - 1)
      })
      .catch(() => {})

    if (!next) return
    const remaining = totalSets - doneSets - 1
    if (remaining === 0) finish({ auto: true })
    else timer.start(ex.restSeconds ?? restPreset)
  }

  const finish = async ({ auto = false } = {}) => {
    if (finishing || result) return
    setFinishing(true)
    setConfirmEarly(false)
    timer.reset(restPreset)
    try {
      const saves = await Promise.allSettled([...pendingSaves.current])
      if (auto && saves.some((s) => s.status === 'rejected')) return // a set failed to save, so it isn't really done
      const res = await api('/workouts/complete', { method: 'POST', body: { workoutId: initial.id } })
      setResult({ duration: res.workout.durationMinutes, streak: res.streak })
      celebrate()
      refreshAuth()
    } catch (err) {
      toast({ title: 'Couldn’t save your workout', message: `${err.message} Your sets are safe. Tap “Finish workout” to retry.`, type: 'error', duration: 6000 })
    } finally {
      setFinishing(false)
    }
  }

  const setsLeft = totalSets - doneSets

  return (
    <Page
      eyebrow="Live workout"
      title={initial.name}
      actions={
        <div className="flex items-center gap-2">
          <span className="chip !py-2 font-display text-sm tabular-nums">
            <Clock size={14} className="text-lime" /> {fmt(elapsed)}
          </span>
          <span className="chip !py-2 text-sm">
            <Layers size={14} className="text-cyan" /> {doneSets}/{totalSets} sets
          </span>
        </div>
      }
    >
      <div className="mb-6">
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-muted">
            <span className="font-semibold text-fg">{doneSets}</span> / {totalSets} sets
          </span>
          <span className="font-display font-semibold text-lime">{Math.round(pct * 100)}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-fg/10">
          <motion.div
            className="h-full rounded-full bg-gradient-brand"
            animate={{ width: `${pct * 100}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <RestTimer timer={timer} preset={restPreset} setPreset={setRestPreset} />

        <div className="space-y-4">
          {exercises.map((ex, idx) => {
            const complete = ex.setsDetail.length > 0 && ex.setsDetail.every((s) => s.completed)
            return (
              <GlassCard key={ex.workoutExerciseId} hover={false} className={complete ? '!border-lime/40' : ''}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="eyebrow">
                      Exercise {idx + 1} · {ex.muscleGroup}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold">{ex.name}</h3>
                    <p className="text-sm text-muted">
                      {ex.sets} sets × {ex.reps} · rest {ex.restSeconds}s
                    </p>
                  </div>
                  <AnimatePresence>
                    {complete && (
                      <motion.span
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0 }}
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-brand text-ink"
                      >
                        <Check size={18} strokeWidth={3} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {ex.setsDetail.map((set) => (
                    <motion.button
                      key={set.id}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => toggleSet(ex, set)}
                      aria-pressed={set.completed}
                      disabled={finishing || !!result}
                      className={`flex items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-colors disabled:cursor-default ${
                        set.completed ? 'border-lime/50 bg-lime/15' : 'hairline bg-fg/[0.03] hover:bg-fg/[0.06]'
                      }`}
                    >
                      <span
                        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition-colors ${
                          set.completed ? 'border-transparent bg-volt text-ink' : 'border-fg/20'
                        }`}
                      >
                        {set.completed && <Check size={14} strokeWidth={3.2} />}
                      </span>
                      <span className="leading-tight">
                        <span className="block text-sm font-semibold">Set {set.setNumber}</span>
                        <span className="block text-xs text-muted">{ex.reps} reps</span>
                      </span>
                    </motion.button>
                  ))}
                </div>
              </GlassCard>
            )
          })}

          {!result && (
            <div className="flex flex-col items-center gap-2 pt-2">
              {confirmEarly ? (
                <div className="flex flex-wrap justify-center gap-2">
                  <button className="btn-primary" onClick={() => finish()} disabled={finishing}>
                    {finishing ? <Loader2 size={16} className="animate-spin" /> : <Flag size={16} />} Yes, finish with {plural(setsLeft, 'set')} left
                  </button>
                  <button className="btn-ghost" onClick={() => setConfirmEarly(false)}>
                    Keep going
                  </button>
                </div>
              ) : (
                <button
                  className={setsLeft === 0 ? 'btn-primary' : 'btn-ghost'}
                  onClick={() => (setsLeft === 0 ? finish() : setConfirmEarly(true))}
                  disabled={finishing}
                >
                  {finishing ? <Loader2 size={16} className="animate-spin" /> : <Flag size={16} />}
                  {finishing ? 'Saving your workout…' : 'Finish workout'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <CompleteModal
            stats={{ time: `${result.duration} min`, sets: doneSets, exercises: exercises.length }}
            streak={result.streak}
            onClose={onFinished}
            onLibrary={() => navigate('/library')}
            onDashboard={() => navigate('/dashboard')}
          />
        )}
      </AnimatePresence>
    </Page>
  )
}

function RestTimer({ timer, preset, setPreset }) {
  const size = 260
  const stroke = 14
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const frac = timer.total ? timer.remaining / timer.total : 0
  const resting = timer.running || (timer.remaining > 0 && timer.remaining < timer.total)

  return (
    <GlassCard hover={false} className="flex flex-col items-center p-6 lg:sticky lg:top-8 lg:self-start">
      <div className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${timer.running ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime/20 blur-3xl" />
      </div>
      <p className="eyebrow relative flex items-center gap-2">
        <Timer size={14} className="text-lime" /> Rest timer
      </p>

      <div className="relative my-6" style={{ width: size, height: size, maxWidth: '100%' }}>
        <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full -rotate-90" aria-hidden="true">
          <defs>
            <linearGradient id="rest-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#c6ff3d" />
              <stop offset="100%" stopColor="#22e4ff" />
            </linearGradient>
          </defs>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} style={{ stroke: 'rgb(var(--fg) / 0.08)' }} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="url(#rest-grad)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - frac)}
            style={{ transition: 'stroke-dashoffset 0.15s linear', filter: 'drop-shadow(0 0 8px rgb(198 255 61 / 0.5))' }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <motion.p
              key={Math.ceil(timer.remaining)}
              initial={{ scale: timer.running ? 1.06 : 1, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 1 }}
              className="font-display text-6xl font-bold tabular-nums sm:text-7xl"
              data-testid="rest-timer"
            >
              {fmt(timer.remaining)}
            </motion.p>
            <p className="mt-1 text-sm text-muted">
              {timer.running ? 'Recover…' : resting ? 'Paused' : 'Tick a set to start'}
            </p>
          </div>
        </div>
      </div>

      <div className="relative flex items-center gap-3">
        <IconBtn label="Reset" onClick={() => timer.reset(preset)}>
          <RotateCcw size={18} />
        </IconBtn>
        <button
          onClick={() => (timer.running ? timer.pause() : resting ? timer.resume() : timer.start(preset))}
          className="grid h-16 w-16 place-items-center rounded-full bg-gradient-brand text-ink shadow-glow transition active:scale-95"
          aria-label={timer.running ? 'Pause' : 'Start'}
        >
          {timer.running ? <Pause size={26} fill="currentColor" /> : <Play size={26} fill="currentColor" className="ml-1" />}
        </button>
        <IconBtn label="Add 15 seconds" onClick={() => timer.add(15)}>
          <Plus size={18} />
          <span className="sr-only">15s</span>
        </IconBtn>
        <IconBtn label="Skip rest" onClick={() => timer.reset(preset)}>
          <SkipForward size={18} />
        </IconBtn>
      </div>

      <div className="relative mt-6 flex gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => {
              setPreset(p)
              if (!timer.running) timer.reset(p)
            }}
            className={`rounded-full px-3.5 py-2.5 text-xs font-semibold transition ${
              preset === p ? 'bg-volt text-ink' : 'border hairline text-muted hover:text-fg'
            }`}
          >
            {p}s
          </button>
        ))}
      </div>
      <p className="relative mt-3 text-xs text-muted">Ticking a set starts that exercise’s own rest time.</p>
    </GlassCard>
  )
}

function IconBtn({ children, label, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid h-12 w-12 place-items-center rounded-full border hairline text-fg transition hover:bg-fg/5 active:scale-95"
    >
      {children}
    </button>
  )
}

function CompleteModal({ stats, streak, onClose, onLibrary, onDashboard }) {
  return createPortal(
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center bg-bg/70 p-4 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="complete-title"
        initial={{ scale: 0.85, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        onClick={(e) => e.stopPropagation()}
        className="glass relative w-full max-w-md overflow-hidden p-8 text-center"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-lime/20 to-transparent" />
        <button onClick={onClose} className="absolute right-4 top-4 text-muted hover:text-fg" aria-label="Close">
          <X size={18} />
        </button>
        <motion.div
          initial={{ rotate: -20, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 220, damping: 12 }}
          className="relative mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-gradient-brand text-ink shadow-glow"
        >
          <Trophy size={38} />
        </motion.div>
        <h2 id="complete-title" className="relative mt-6 text-3xl font-bold">
          Workout <span className="text-gradient">crushed!</span>
        </h2>
        <p className="relative mt-2 text-muted">
          {streak > 1 ? `That’s day ${streak} of your streak.` : 'Day 1 of a brand-new streak.'} Your future self says thanks.
        </p>
        <div className="relative mt-6 grid grid-cols-3 gap-2">
          {[
            ['Time', stats.time],
            ['Sets', stats.sets],
            ['Exercises', stats.exercises],
          ].map(([k, v]) => (
            <div key={k} className="rounded-2xl bg-fg/5 py-3">
              <p className="font-display text-xl font-bold">{v}</p>
              <p className="text-xs text-muted">{k}</p>
            </div>
          ))}
        </div>
        <div className="relative mt-6 flex flex-col gap-2 sm:flex-row">
          <button className="btn-primary flex-1" onClick={onDashboard}>
            Back to dashboard
          </button>
          <button className="btn-ghost flex-1" onClick={onLibrary}>
            <Plus size={16} /> Add more
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  )
}

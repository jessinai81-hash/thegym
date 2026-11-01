import { forwardRef, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Dumbbell, Heart, Loader2, Play, Plus, Repeat, Search, SearchX, Timer, X } from 'lucide-react'
import Page from '../components/Page.jsx'
import EmptyState from '../components/EmptyState.jsx'
import ErrorState from '../components/ErrorState.jsx'
import DifficultyBadge from '../components/DifficultyBadge.jsx'
import { Skeleton } from '../components/Skeleton.jsx'
import { useToast } from '../components/Toast.jsx'
import useApi from '../hooks/useApi.js'
import useUnsavedWarning from '../hooks/useUnsavedWarning.js'
import { api } from '../lib/api.js'
import { plural } from '../lib/format.js'
import { muscleGroups } from '../data/mock.js'

const groupAccent = {
  Chest: 'from-lime/25',
  Back: 'from-cyan/25',
  Legs: 'from-violet-400/25',
  Arms: 'from-orange-400/25',
  Core: 'from-yellow-300/25',
  Cardio: 'from-rose-400/25',
}

export default function Library() {
  const exercisesReq = useApi('/exercises')
  const workoutReq = useApi('/workouts')
  const [group, setGroup] = useState('All')
  const [query, setQuery] = useState('')
  const [favs, setFavs] = useState(() => new Set())
  const [pending, setPending] = useState(() => new Set())
  const saveQueue = useRef(Promise.resolve())
  const toast = useToast()
  useUnsavedWarning(pending.size > 0)

  const exercises = exercisesReq.data?.exercises ?? []
  const workout = workoutReq.data?.workout ?? null
  const openWorkout = workout && workout.status !== 'completed' ? workout : null
  // exerciseId -> workoutExerciseId for everything already in today's open workout
  const added = useMemo(
    () => new Map((openWorkout?.exercises ?? []).map((e) => [e.exerciseId, e.workoutExerciseId])),
    [openWorkout],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return exercises.filter(
      (e) =>
        (group === 'All' || e.muscleGroup === group) &&
        (!q || e.name.toLowerCase().includes(q) || (e.description ?? '').toLowerCase().includes(q)),
    )
  }, [exercises, group, query])

  const toggleFav = (e) => {
    const wasFav = favs.has(e.id)
    setFavs((prev) => {
      const next = new Set(prev)
      if (wasFav) next.delete(e.id)
      else next.add(e.id)
      return next
    })
    toast(
      wasFav
        ? { title: 'Removed from favorites', message: e.name, type: 'info' }
        : { title: 'Saved to favorites', message: e.name, type: 'success' },
    )
  }

  const markPending = (id, on) =>
    setPending((prev) => {
      const next = new Set(prev)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })

  const toggleToday = (e) => {
    if (pending.has(e.id)) return
    const workoutExerciseId = added.get(e.id)
    const wasCompleted = workoutReq.data?.workout?.status === 'completed'
    markPending(e.id, true)

    // Optimistic: show the new state right away, roll back if the server says no.
    if (workoutExerciseId) {
      workoutReq.setData((d) => ({
        workout: { ...d.workout, exercises: d.workout.exercises.filter((x) => x.workoutExerciseId !== workoutExerciseId) },
      }))
    } else {
      workoutReq.setData((d) => {
        const base = d?.workout && d.workout.status !== 'completed' ? d.workout : { status: 'planned', exercises: [] }
        return { workout: { ...base, exercises: [...base.exercises, { exerciseId: e.id, workoutExerciseId: -e.id, setsDetail: [] }] } }
      })
    }

    // Requests run one at a time, in tap order, so quick taps keep their order in the workout.
    const save = async () => {
      try {
        if (workoutExerciseId) {
          const res = await api('/workouts/remove-exercise', { method: 'POST', body: { workoutExerciseId } })
          workoutReq.setData({ workout: res.workout })
          toast({ title: 'Removed from today', message: e.name, type: 'info' })
        } else {
          const res = await api('/workouts/add-exercise', { method: 'POST', body: { exerciseId: e.id } })
          workoutReq.setData({ workout: res.workout })
          toast({
            title: res.alreadyAdded ? 'Already in today’s workout' : 'Added to today’s workout 💪',
            message: wasCompleted
              ? `${e.name} started a fresh session. You already finished one today!`
              : `${e.name} · ${plural(res.workout.exercises.length, 'exercise')} lined up.`,
            type: 'success',
          })
        }
      } catch (err) {
        workoutReq.reload() // resync with the server rather than guess which optimistic changes to undo
        toast({ title: 'Couldn’t update your workout', message: err.message, type: 'error' })
      } finally {
        markPending(e.id, false)
      }
    }
    saveQueue.current = saveQueue.current.then(save, save)
  }

  const reset = () => {
    setGroup('All')
    setQuery('')
  }

  const loading = exercisesReq.loading && !exercisesReq.data
  const error = exercisesReq.error ?? workoutReq.error
  const queued = openWorkout?.exercises.length ?? 0

  return (
    <Page
      eyebrow={loading ? 'Loading exercises…' : `${exercises.length} exercises`}
      title="Workout Library"
      subtitle="Pick a muscle group, find a move, add it to today."
      actions={
        queued > 0 && (
          <Link to="/workout" className="btn-primary !py-2.5">
            <Play size={16} fill="currentColor" /> Start today’s workout
            <span className="rounded-full bg-ink/15 px-2 py-0.5 text-xs">{queued}</span>
          </Link>
        )
      }
    >
      <div className="mb-6 space-y-4">
        <label className="glass flex items-center gap-3 !rounded-2xl px-4 py-3">
          <Search size={18} className="text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search exercises…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
          />
          {query && (
            <button onClick={() => setQuery('')} aria-label="Clear search" className="text-muted hover:text-fg">
              <X size={16} />
            </button>
          )}
        </label>

        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist">
          {muscleGroups.map((g) => {
            const active = g === group
            return (
              <button
                key={g}
                role="tab"
                aria-selected={active}
                onClick={() => setGroup(g)}
                className={`relative shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active ? 'text-ink' : 'border hairline text-muted hover:text-fg'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="group-pill"
                    className="absolute inset-0 rounded-full bg-volt"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative">{g}</span>
              </button>
            )
          })}
        </div>
      </div>

      {error ? (
        <ErrorState
          error={error}
          onRetry={() => {
            exercisesReq.reload()
            workoutReq.reload()
          }}
        />
      ) : loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass p-5" role="status" aria-label="Loading">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="mt-2 h-6 w-3/4" />
              <Skeleton className="mt-3 h-4 w-full" />
              <div className="mt-5 grid grid-cols-3 gap-2">
                {[0, 1, 2].map((j) => (
                  <Skeleton key={j} className="h-16 rounded-2xl" />
                ))}
              </div>
              <Skeleton className="mt-5 h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : exercises.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="The library is empty"
          message="No exercises in the database yet. Run “npm run db:setup” to load the sample library."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No exercises match that"
          message={`We couldn’t find “${query}”${group !== 'All' ? ` in ${group}` : ''}. Try another name, or clear the filters.`}
          action={
            <button className="btn-primary !py-2.5" onClick={reset}>
              Clear filters
            </button>
          }
        />
      ) : (
        <motion.div layout className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((e) => (
              <ExerciseCard
                key={e.id}
                e={e}
                fav={favs.has(e.id)}
                onFav={() => toggleFav(e)}
                isAdded={added.has(e.id)}
                busy={pending.has(e.id)}
                onToggleToday={() => toggleToday(e)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </Page>
  )
}

// forwardRef lets AnimatePresence's popLayout measure cards as they leave.
const ExerciseCard = forwardRef(function ExerciseCard({ e, fav, onFav, isAdded, busy, onToggleToday }, ref) {
  return (
    <motion.article
      ref={ref}
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      className={`glass group relative flex flex-col overflow-hidden p-5 transition-shadow hover:shadow-glow ${isAdded ? '!border-lime/40' : ''}`}
    >
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${groupAccent[e.muscleGroup]} to-transparent`} />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">{e.muscleGroup}</p>
          <h3 className="mt-1 text-lg font-semibold leading-snug">{e.name}</h3>
        </div>
        <button
          onClick={onFav}
          aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border hairline transition hover:bg-fg/5"
        >
          <Heart size={16} className={fav ? 'fill-rose-400 text-rose-400' : 'text-muted'} />
        </button>
      </div>
      {e.description && <p className="relative mt-2 line-clamp-2 text-sm text-muted">{e.description}</p>}

      <div className="relative mt-5 grid grid-cols-3 gap-2 text-center">
        <Stat icon={Repeat} label="Sets" value={e.sets} />
        <Stat icon={Dumbbell} label="Reps" value={e.reps} />
        <Stat icon={Timer} label="Rest" value={`${e.restSeconds}s`} />
      </div>

      <div className="relative mt-auto flex flex-wrap items-center justify-between gap-2 pt-5">
        <DifficultyBadge level={e.difficulty} />
        <button
          onClick={onToggleToday}
          disabled={busy}
          aria-pressed={isAdded}
          className={`!rounded-xl !px-3.5 !py-2 ${isAdded ? 'btn-ghost !border-lime/40 text-lime' : 'btn-primary'}`}
          title={isAdded ? 'Tap to remove from today' : 'Add to today’s workout'}
        >
          {busy ? <Loader2 size={15} className="animate-spin" /> : isAdded ? <Check size={15} /> : <Plus size={15} />}
          {isAdded ? 'In today’s workout' : 'Add to today’s workout'}
        </button>
      </div>
    </motion.article>
  )
})

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl bg-fg/[0.04] px-2 py-3">
      <Icon size={14} className="mx-auto text-lime" />
      <p className="mt-1.5 font-display text-sm font-semibold">{value}</p>
      <p className="text-[11px] text-muted">{label}</p>
    </div>
  )
}

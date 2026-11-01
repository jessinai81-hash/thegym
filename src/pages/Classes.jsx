import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarX2, Check, Clock, MapPin, UserRound, Users } from 'lucide-react'
import Page from '../components/Page.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { useToast } from '../components/Toast.jsx'
import { useApp } from '../context/AppContext.jsx'
import { classes, classTypes, weekDays } from '../data/mock.js'

const types = ['All', ...Object.keys(classTypes)]

export default function Classes() {
  const [day, setDay] = useState(weekDays[0].key)
  const [type, setType] = useState('All')
  const { bookings, book, cancel } = useApp()
  const toast = useToast()

  const list = useMemo(
    () => classes.filter((c) => c.day === day && (type === 'All' || c.type === type)),
    [day, type],
  )

  const counts = useMemo(
    () => Object.fromEntries(weekDays.map((d) => [d.key, classes.filter((c) => c.day === d.key).length])),
    [],
  )

  const handleBook = (c, spotsLeft) => {
    if (bookings.includes(c.id)) {
      cancel(c.id)
      toast({ title: 'Booking cancelled', message: `Your spot in ${c.title} is free for someone else.`, type: 'info' })
      return
    }
    if (spotsLeft <= 0) {
      toast({
        title: 'This one’s packed!',
        message: `${c.title} is full. Try another time — or we’ll hold a waitlist spot when it opens.`,
        type: 'error',
      })
      return
    }
    book(c.id)
    const d = weekDays.find((x) => x.key === c.day)
    toast({ title: 'You’re booked! 🎉', message: `${c.title} · ${d.short} ${d.date} at ${c.time}. See you there.`, type: 'success' })
  }

  return (
    <Page eyebrow="Week of Oct 26" title="Class Booking" subtitle="Yoga, HIIT, Spin and Boxing — grab your spot before it’s gone.">
      {/* day strip */}
      <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {weekDays.map((d) => {
          const active = d.key === day
          return (
            <button
              key={d.key}
              onClick={() => setDay(d.key)}
              className={`relative flex w-[4.25rem] shrink-0 flex-col items-center rounded-2xl py-3 transition-colors sm:flex-1 ${
                active ? 'text-ink' : 'glass !rounded-2xl text-fg hover:bg-fg/5'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="day-pill"
                  className="absolute inset-0 rounded-2xl bg-gradient-brand shadow-glow"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className={`relative text-xs ${active ? 'text-ink/70' : 'text-muted'}`}>{d.short}</span>
              <span className="relative font-display text-xl font-bold">{d.date}</span>
              <span className="relative mt-1 flex gap-0.5">
                {Array.from({ length: Math.min(counts[d.key], 3) }).map((_, i) => (
                  <span key={i} className={`h-1 w-1 rounded-full ${active ? 'bg-ink/60' : 'bg-lime'}`} />
                ))}
              </span>
            </button>
          )
        })}
      </div>

      {/* type filter */}
      <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
              t === type ? 'bg-fg text-bg' : 'border hairline text-muted hover:text-fg'
            }`}
          >
            {t !== 'All' && <span className={`h-2 w-2 rounded-full ${classTypes[t].dot}`} />}
            {t}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={day + type}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          {list.length === 0 ? (
            <EmptyState
              icon={CalendarX2}
              title={counts[day] === 0 ? 'Rest day — no classes scheduled' : `No ${type} classes this day`}
              message={
                counts[day] === 0
                  ? 'Studios are closed for recovery. Stretch, hydrate, and come back stronger tomorrow.'
                  : 'Try another class type or pick a different day.'
              }
              action={
                type !== 'All' && (
                  <button className="btn-primary !py-2.5" onClick={() => setType('All')}>
                    Show all classes
                  </button>
                )
              }
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {list.map((c, i) => (
                <ClassCard key={c.id} c={c} index={i} booked={bookings.includes(c.id)} onBook={handleBook} />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </Page>
  )
}

function ClassCard({ c, index, booked, onBook }) {
  const t = classTypes[c.type]
  const spotsLeft = c.spots - (booked ? 1 : 0)
  const full = c.spots <= 0 && !booked
  const fill = (c.capacity - spotsLeft) / c.capacity

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ y: -4 }}
      className={`glass relative overflow-hidden p-5 transition-shadow hover:shadow-glow ${booked ? '!border-lime/40' : ''}`}
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${t.color} opacity-60`} />
      <div className="relative flex items-start gap-4">
        <div className="w-16 shrink-0 text-center">
          <p className="font-display text-2xl font-bold leading-none">{c.time}</p>
          <p className="mt-1 text-xs text-muted">{c.duration} min</p>
        </div>
        <div className="min-w-0 flex-1 border-l hairline pl-4">
          <span className="chip">
            <span className={`h-2 w-2 rounded-full ${t.dot}`} /> {c.type}
          </span>
          <h3 className="mt-2 text-lg font-semibold">{c.title}</h3>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
            <span className="flex items-center gap-1.5">
              <UserRound size={13} /> {c.coach}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={13} /> {c.room}
            </span>
          </div>
        </div>
      </div>

      <div className="relative mt-5">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-muted">
            <Users size={13} /> {c.capacity - spotsLeft}/{c.capacity} booked
          </span>
          <span
            className={`font-semibold ${
              full ? 'text-orange-600 dark:text-orange-400' : spotsLeft <= 3 ? 'text-amber-600 dark:text-yellow-400' : 'text-lime'
            }`}
          >
            {full ? 'Full' : `${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} left`}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-fg/10">
          <motion.div
            className={`h-full rounded-full ${full ? 'bg-orange-400' : 'bg-gradient-brand'}`}
            initial={{ width: 0 }}
            animate={{ width: `${fill * 100}%` }}
            transition={{ duration: 0.8, delay: 0.2 + index * 0.06 }}
          />
        </div>
      </div>

      <button
        onClick={() => onBook(c, c.spots)}
        className={`relative mt-5 w-full ${booked ? 'btn-ghost !border-lime/40 text-lime' : full ? 'btn-ghost text-muted' : 'btn-primary'}`}
      >
        {booked ? (
          <>
            <Check size={16} /> Booked · tap to cancel
          </>
        ) : full ? (
          'Class full — join waitlist'
        ) : (
          <>
            <Clock size={16} /> Book spot
          </>
        )}
      </button>
    </motion.article>
  )
}

import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ArrowRight, Lock, Mail, Minus, Plus, Timer, UserRound } from 'lucide-react'
import AuthLayout, { Field, FormError } from '../components/AuthLayout.jsx'
import PasswordToggle from '../components/PasswordToggle.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../components/Toast.jsx'
import { firstName } from '../lib/format.js'

const MINUTE_PRESETS = [90, 150, 200, 300]

export default function Signup() {
  const { user, signup } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [form, setForm] = useState({ fullName: '', email: '', password: '', weeklyGoalWorkouts: 4, weeklyGoalMinutes: 180 })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user && !busy) return <Navigate to="/dashboard" replace />

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const setNum = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 8) return setError('Your password needs at least 8 characters.')
    setBusy(true)
    try {
      const u = await signup(form)
      toast({ title: `Welcome to PulseFit, ${firstName(u.fullName)}! 🎉`, message: 'Pick a few exercises to build today’s workout.', type: 'success' })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  const canSubmit = form.fullName.trim() && form.email && form.password

  return (
    <AuthLayout
      eyebrow="Join PulseFit"
      title="Create your account"
      subtitle="Two minutes now, a stronger you every week."
      footer={
        <>
          Already a member?{' '}
          <Link to="/login" className="inline-block py-2.5 font-semibold text-lime hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Field label="Your name" icon={UserRound} autoComplete="name" placeholder="Alex Rivera" value={form.fullName} onChange={set('fullName')} maxLength={80} required />
        <Field label="Email" icon={Mail} type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
        <Field
          label="Password"
          icon={Lock}
          type={showPw ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={form.password}
          onChange={set('password')}
          required
          right={<PasswordToggle shown={showPw} onToggle={() => setShowPw((s) => !s)} />}
        />

        <div className="rounded-2xl border hairline bg-fg/[0.03] p-4">
          <p className="eyebrow">Weekly goals</p>

          <div className="mt-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Workouts per week</p>
              <p className="text-xs text-muted">Most members start with 3–4</p>
            </div>
            <div className="flex items-center gap-2">
              <Stepper label="Fewer workouts" onClick={() => setNum('weeklyGoalWorkouts', Math.max(1, form.weeklyGoalWorkouts - 1))}>
                <Minus size={16} />
              </Stepper>
              <span className="w-8 text-center font-display text-2xl font-bold tabular-nums">{form.weeklyGoalWorkouts}</span>
              <Stepper label="More workouts" onClick={() => setNum('weeklyGoalWorkouts', Math.min(14, form.weeklyGoalWorkouts + 1))}>
                <Plus size={16} />
              </Stepper>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-sm font-medium">
                <Timer size={15} className="text-lime" /> Active minutes per week
              </p>
              <span className="font-display text-lg font-bold tabular-nums">{form.weeklyGoalMinutes}</span>
            </div>
            <input
              type="range"
              min={30}
              max={600}
              step={15}
              value={form.weeklyGoalMinutes}
              onChange={(e) => setNum('weeklyGoalMinutes', Number(e.target.value))}
              className="mt-1 h-9 w-full cursor-pointer accent-[#c6ff3d]"
              aria-label="Active minutes per week"
            />
            <div className="mt-2 flex gap-2">
              {MINUTE_PRESETS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setNum('weeklyGoalMinutes', m)}
                  className={`flex-1 rounded-full py-2.5 text-xs font-semibold transition ${
                    form.weeklyGoalMinutes === m ? 'bg-volt text-ink' : 'border hairline text-muted hover:text-fg'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        <FormError message={error} />
        <button type="submit" className="btn-primary group w-full !py-3.5 !text-base" disabled={busy || !canSubmit}>
          {busy ? 'Creating your account…' : 'Create account'}
          {!busy && <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />}
        </button>
      </form>
    </AuthLayout>
  )
}

function Stepper({ children, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-9 w-9 place-items-center rounded-xl border hairline transition hover:bg-fg/5 active:scale-95"
    >
      {children}
    </button>
  )
}

import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, Lock, Mail } from 'lucide-react'
import AuthLayout, { Field, FormError } from '../components/AuthLayout.jsx'
import PasswordToggle from '../components/PasswordToggle.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../components/Toast.jsx'
import { firstName } from '../lib/format.js'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const from = location.state?.from && location.state.from !== '/login' ? location.state.from : '/dashboard'
  if (user && !busy) return <Navigate to={from} replace />

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const u = await login(form.email, form.password)
      toast({ title: `Welcome back, ${firstName(u.fullName)}!`, message: 'Let’s get after it.', type: 'success' })
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Log in to PulseFit"
      subtitle="Your streak is waiting. Don’t keep it hanging."
      footer={
        <>
          New here?{' '}
          <Link to="/signup" className="inline-block py-2.5 font-semibold text-lime hover:underline">
            Create a free account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Field label="Email" icon={Mail} type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
        <Field
          label="Password"
          icon={Lock}
          type={showPw ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="••••••••"
          value={form.password}
          onChange={set('password')}
          required
          right={<PasswordToggle shown={showPw} onToggle={() => setShowPw((s) => !s)} />}
        />
        <FormError message={error} />
        <button type="submit" className="btn-primary group w-full !py-3.5 !text-base" disabled={busy || !form.email || !form.password}>
          {busy ? 'Logging in…' : 'Log in'}
          {!busy && <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />}
        </button>
      </form>
    </AuthLayout>
  )
}

import { HttpError } from './http.js'

export function publicUser(row) {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    weeklyGoalWorkouts: row.weekly_goal_workouts,
    weeklyGoalMinutes: row.weekly_goal_minutes,
    createdAt: row.created_at,
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizeEmail(email) {
  const e = String(email ?? '').trim().toLowerCase()
  if (!EMAIL_RE.test(e) || e.length > 254) throw new HttpError(400, 'Please enter a valid email address.', 'invalid_email')
  return e
}

export function validatePassword(password) {
  const p = String(password ?? '')
  if (p.length < 8) throw new HttpError(400, 'Your password needs at least 8 characters.', 'weak_password')
  if (p.length > 200) throw new HttpError(400, 'That password is a bit too long (200 characters max).', 'weak_password')
  return p
}

export function intInRange(value, min, max, label) {
  const n = Number(value)
  if (!Number.isInteger(n) || n < min || n > max) {
    throw new HttpError(400, `${label} should be between ${min} and ${max}.`, 'invalid_goal')
  }
  return n
}

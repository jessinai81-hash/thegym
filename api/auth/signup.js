import bcrypt from 'bcryptjs'
import { db } from '../_lib/db.js'
import { assertAuthConfigured, setSession } from '../_lib/auth.js'
import { HttpError, readBody, route } from '../_lib/http.js'
import { intInRange, normalizeEmail, publicUser, validatePassword } from '../_lib/users.js'

export default route({
  async POST(req, res) {
    assertAuthConfigured()
    const body = readBody(req)
    const fullName = String(body.fullName ?? '').trim()
    if (fullName.length < 1 || fullName.length > 80) {
      throw new HttpError(400, 'Please tell us your name (up to 80 characters).', 'invalid_name')
    }
    const email = normalizeEmail(body.email)
    const password = validatePassword(body.password)
    const goalWorkouts = intInRange(body.weeklyGoalWorkouts ?? 4, 1, 14, 'Weekly workouts goal')
    const goalMinutes = intInRange(body.weeklyGoalMinutes ?? 180, 30, 2000, 'Weekly minutes goal')

    const hash = await bcrypt.hash(password, 10)
    const sql = db()
    const [row] = await sql`
      INSERT INTO users (email, password_hash, full_name, weekly_goal_workouts, weekly_goal_minutes)
      VALUES (${email}, ${hash}, ${fullName}, ${goalWorkouts}, ${goalMinutes})
      ON CONFLICT (email) DO NOTHING
      RETURNING id, email, full_name, weekly_goal_workouts, weekly_goal_minutes, created_at`
    if (!row) throw new HttpError(409, 'An account with that email already exists. Try logging in instead.', 'email_taken')

    await setSession(res, row.id)
    res.status(201).json({ user: publicUser(row), stats: { workoutsCompleted: 0, streak: 0 } })
  },
})

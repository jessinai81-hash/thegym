import bcrypt from 'bcryptjs'
import { db } from '../_lib/db.js'
import { assertAuthConfigured, setSession } from '../_lib/auth.js'
import { HttpError, readBody, route } from '../_lib/http.js'
import { getTimeZone, localDate } from '../_lib/time.js'
import { streaks } from '../_lib/workouts.js'
import { normalizeEmail, publicUser } from '../_lib/users.js'

// Compared against when the email doesn't exist, so response time doesn't reveal which emails are registered.
const DUMMY_HASH = bcrypt.hashSync('pulsefit-timing-guard', 10)

export default route({
  async POST(req, res) {
    assertAuthConfigured()
    const body = readBody(req)
    const email = normalizeEmail(body.email)
    const password = String(body.password ?? '')

    const sql = db()
    const [row] = await sql`
      SELECT id, email, password_hash, full_name, weekly_goal_workouts, weekly_goal_minutes, created_at
      FROM users WHERE email = ${email}`
    const ok = await bcrypt.compare(password, row?.password_hash ?? DUMMY_HASH)
    if (!row || !ok) throw new HttpError(401, 'That email and password don’t match. Give it another try.', 'invalid_credentials')

    await setSession(res, row.id)
    const tz = getTimeZone(req)
    const [{ count }] = await sql`SELECT count(*)::int AS count FROM workouts WHERE user_id = ${row.id} AND status = 'completed'`
    const streak = await streaks(sql, row.id, tz, localDate(tz))
    res.status(200).json({ user: publicUser(row), stats: { workoutsCompleted: count, streak: streak.current } })
  },
})

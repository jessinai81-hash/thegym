import { db } from '../_lib/db.js'
import { clearSession, getUserId } from '../_lib/auth.js'
import { HttpError, route } from '../_lib/http.js'
import { getTimeZone, localDate } from '../_lib/time.js'
import { streaks } from '../_lib/workouts.js'
import { publicUser } from '../_lib/users.js'

export default route({
  // 401 when logged out (or the account no longer exists); the app treats that as "show login".
  async GET(req, res) {
    const userId = await getUserId(req)
    if (!userId) {
      clearSession(res) // drop a stale "logged in" hint along with any expired session
      throw new HttpError(401, 'Please log in to continue.', 'unauthorized')
    }

    const sql = db()
    const [row] = await sql`
      SELECT id, email, full_name, weekly_goal_workouts, weekly_goal_minutes, created_at
      FROM users WHERE id = ${userId}`
    if (!row) {
      clearSession(res)
      throw new HttpError(401, 'Please log in to continue.', 'unauthorized')
    }

    const tz = getTimeZone(req)
    const [{ count }] = await sql`SELECT count(*)::int AS count FROM workouts WHERE user_id = ${userId} AND status = 'completed'`
    const streak = await streaks(sql, userId, tz, localDate(tz))
    res.status(200).json({ user: publicUser(row), stats: { workoutsCompleted: count, streak: streak.current } })
  },
})

import { db } from '../_lib/db.js'
import { requireUserId } from '../_lib/auth.js'
import { route } from '../_lib/http.js'
import { getTimeZone, localDate } from '../_lib/time.js'
import { findTodayWorkout, findWorkout, getOrCreateOpenWorkout } from '../_lib/workouts.js'

export default route({
  // GET /api/workouts → the logged-in user's workout for today (or null), with exercises and sets.
  async GET(req, res) {
    const userId = await requireUserId(req)
    const workout = await findTodayWorkout(db(), userId, localDate(getTimeZone(req)))
    res.status(200).json({ workout })
  },

  // POST /api/workouts → creates today's (empty, planned) workout, or returns the open one if it exists.
  async POST(req, res) {
    const userId = await requireUserId(req)
    const sql = db()
    const today = localDate(getTimeZone(req))
    const [existing] = await sql`
      SELECT id FROM workouts
      WHERE user_id = ${userId} AND workout_date = ${today} AND status IN ('planned', 'in_progress')`
    const id = existing?.id ?? (await getOrCreateOpenWorkout(sql, userId, today))
    res.status(existing ? 200 : 201).json({ workout: await findWorkout(sql, userId, id), created: !existing })
  },
})

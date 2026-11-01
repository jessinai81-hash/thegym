import { db } from '../../_lib/db.js'
import { requireUserId } from '../../_lib/auth.js'
import { HttpError, readBody, route, toInt } from '../../_lib/http.js'
import { getTimeZone, localDate } from '../../_lib/time.js'
import { streaks } from '../../_lib/workouts.js'

// POST /api/workouts/complete { workoutId } → saves the duration (measured on the server) and marks it completed.
export default route({
  async POST(req, res) {
    const userId = await requireUserId(req)
    const workoutId = toInt(readBody(req).workoutId, 'workoutId')
    const sql = db()
    const [w] = await sql`
      UPDATE workouts
      SET status = 'completed',
          completed_at = now(),
          started_at = COALESCE(started_at, now()),
          duration_minutes = LEAST(240, GREATEST(1, ROUND(EXTRACT(EPOCH FROM (now() - COALESCE(started_at, now()))) / 60)))::int
      WHERE id = ${workoutId} AND user_id = ${userId} AND status <> 'completed'
      RETURNING id, status, duration_minutes AS "durationMinutes", completed_at AS "completedAt"`
    if (!w) throw new HttpError(404, 'That workout is already finished or doesn’t exist.', 'not_found')

    const tz = getTimeZone(req)
    const streak = await streaks(sql, userId, tz, localDate(tz))
    res.status(200).json({ workout: w, streak: streak.current })
  },
})

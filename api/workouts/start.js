import { db } from '../_lib/db.js'
import { requireUserId } from '../_lib/auth.js'
import { HttpError, readBody, route, toInt } from '../_lib/http.js'

// POST /api/workouts/start { workoutId } → marks it in progress (keeps the original start time on repeat calls).
export default route({
  async POST(req, res) {
    const userId = await requireUserId(req)
    const workoutId = toInt(readBody(req).workoutId, 'workoutId')
    const [w] = await db()`
      UPDATE workouts
      SET status = 'in_progress', started_at = COALESCE(started_at, now())
      WHERE id = ${workoutId} AND user_id = ${userId} AND status IN ('planned', 'in_progress')
      RETURNING id, status, started_at AS "startedAt"`
    if (!w) throw new HttpError(404, 'That workout can’t be started. It may already be finished.', 'not_found')
    res.status(200).json({ workout: w })
  },
})

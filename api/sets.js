import { db } from './_lib/db.js'
import { requireUserId } from './_lib/auth.js'
import { HttpError, readBody, route, toInt } from './_lib/http.js'

// PATCH /api/sets { setId, completed } → ticks or unticks one set in your own unfinished workout.
export default route({
  async PATCH(req, res) {
    const userId = await requireUserId(req)
    const body = readBody(req)
    const setId = toInt(body.setId, 'setId')
    if (typeof body.completed !== 'boolean') throw new HttpError(400, '"completed" must be true or false.', 'bad_request')

    const [set] = await db()`
      UPDATE workout_sets s
      SET completed = ${body.completed},
          completed_at = CASE WHEN ${body.completed}::boolean THEN now() ELSE NULL END
      FROM workout_exercises we
      JOIN workouts w ON w.id = we.workout_id
      WHERE s.id = ${setId} AND we.id = s.workout_exercise_id
        AND w.user_id = ${userId} AND w.status <> 'completed'
      RETURNING s.id, s.completed`
    if (!set) throw new HttpError(404, 'That set isn’t part of an open workout of yours.', 'not_found')
    res.status(200).json({ set })
  },
})

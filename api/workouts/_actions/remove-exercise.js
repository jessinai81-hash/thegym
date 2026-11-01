import { db } from '../../_lib/db.js'
import { requireUserId } from '../../_lib/auth.js'
import { HttpError, readBody, route, toInt } from '../../_lib/http.js'
import { findWorkout, renameWorkout } from '../../_lib/workouts.js'

// POST /api/workouts/remove-exercise { workoutExerciseId } → removes it from a workout you haven't finished.
export default route({
  async POST(req, res) {
    const userId = await requireUserId(req)
    const workoutExerciseId = toInt(readBody(req).workoutExerciseId, 'workoutExerciseId')
    const sql = db()

    const [removed] = await sql`
      DELETE FROM workout_exercises we
      USING workouts w
      WHERE we.id = ${workoutExerciseId} AND w.id = we.workout_id
        AND w.user_id = ${userId} AND w.status <> 'completed'
      RETURNING we.workout_id AS "workoutId"`
    if (!removed) throw new HttpError(404, 'That exercise isn’t in an open workout of yours.', 'not_found')

    // An untouched plan with nothing left in it disappears, so "no workout yet" shows again.
    const [deleted] = await sql`
      DELETE FROM workouts w
      WHERE w.id = ${removed.workoutId} AND w.status = 'planned'
        AND NOT EXISTS (SELECT 1 FROM workout_exercises WHERE workout_id = w.id)
      RETURNING id`
    if (deleted) return res.status(200).json({ workout: null })

    await renameWorkout(sql, removed.workoutId)
    res.status(200).json({ workout: await findWorkout(sql, userId, removed.workoutId) })
  },
})

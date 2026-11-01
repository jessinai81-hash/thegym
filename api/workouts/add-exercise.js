import { db } from '../_lib/db.js'
import { requireUserId } from '../_lib/auth.js'
import { HttpError, readBody, route, toInt } from '../_lib/http.js'
import { getTimeZone, localDate } from '../_lib/time.js'
import { findWorkout, getOrCreateOpenWorkout, renameWorkout } from '../_lib/workouts.js'

// POST /api/workouts/add-exercise { exerciseId } → adds it (with its sets) to today's open workout.
export default route({
  async POST(req, res) {
    const userId = await requireUserId(req)
    const exerciseId = toInt(readBody(req).exerciseId, 'exerciseId')
    const sql = db()

    const [exercise] = await sql`SELECT id FROM exercises WHERE id = ${exerciseId}`
    if (!exercise) throw new HttpError(404, 'We couldn’t find that exercise.', 'not_found')

    const workoutId = await getOrCreateOpenWorkout(sql, userId, localDate(getTimeZone(req)))

    // One statement, so the exercise and its sets are added together or not at all.
    const inserted = await sql`
      WITH we AS (
        INSERT INTO workout_exercises (workout_id, exercise_id, order_index)
        SELECT ${workoutId}::int, ${exerciseId}::int,
               COALESCE((SELECT max(order_index) + 1 FROM workout_exercises WHERE workout_id = ${workoutId}::int), 0)
        ON CONFLICT (workout_id, exercise_id) DO NOTHING
        RETURNING id
      )
      INSERT INTO workout_sets (workout_exercise_id, set_number)
      SELECT we.id, n FROM we, exercises e, generate_series(1, e.sets) AS n
      WHERE e.id = ${exerciseId}
      RETURNING workout_exercise_id`

    await renameWorkout(sql, workoutId)
    const workout = await findWorkout(sql, userId, workoutId)
    res.status(inserted.length ? 201 : 200).json({ workout, alreadyAdded: inserted.length === 0 })
  },
})

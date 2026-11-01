import { addDays } from './time.js'

/** Today's workout for this user: an open one if it exists, otherwise the latest completed one. */
export async function findTodayWorkout(sql, userId, today) {
  const [w] = await sql`
    SELECT id, name, workout_date::text AS date, status, duration_minutes AS "durationMinutes",
           started_at AS "startedAt", completed_at AS "completedAt"
    FROM workouts
    WHERE user_id = ${userId} AND workout_date = ${today}
    ORDER BY (status <> 'completed') DESC, id DESC
    LIMIT 1`
  if (!w) return null
  w.exercises = await loadExercises(sql, w.id)
  return w
}

/** Loads one workout, only if it belongs to the user. */
export async function findWorkout(sql, userId, workoutId) {
  const [w] = await sql`
    SELECT id, name, workout_date::text AS date, status, duration_minutes AS "durationMinutes",
           started_at AS "startedAt", completed_at AS "completedAt"
    FROM workouts
    WHERE id = ${workoutId} AND user_id = ${userId}`
  if (!w) return null
  w.exercises = await loadExercises(sql, w.id)
  return w
}

async function loadExercises(sql, workoutId) {
  return sql`
    SELECT we.id AS "workoutExerciseId", we.order_index AS "orderIndex",
           e.id AS "exerciseId", e.name, e.muscle_group AS "muscleGroup", e.sets, e.reps,
           e.difficulty, e.rest_seconds AS "restSeconds", e.description,
           COALESCE(
             json_agg(json_build_object('id', s.id, 'setNumber', s.set_number, 'completed', s.completed)
                      ORDER BY s.set_number) FILTER (WHERE s.id IS NOT NULL),
             '[]'::json
           ) AS "setsDetail"
    FROM workout_exercises we
    JOIN exercises e ON e.id = we.exercise_id
    LEFT JOIN workout_sets s ON s.workout_exercise_id = we.id
    WHERE we.workout_id = ${workoutId}
    GROUP BY we.id, e.id
    ORDER BY we.order_index, we.id`
}

/** Returns the id of today's open workout, creating a planned one if needed. */
export async function getOrCreateOpenWorkout(sql, userId, today) {
  const find = () => sql`
    SELECT id FROM workouts
    WHERE user_id = ${userId} AND workout_date = ${today} AND status IN ('planned', 'in_progress')
    ORDER BY id DESC LIMIT 1`
  let [w] = await find()
  if (w) return w.id
  ;[w] = await sql`
    INSERT INTO workouts (user_id, name, workout_date, status)
    VALUES (${userId}, ${"Today's Workout"}, ${today}, 'planned')
    ON CONFLICT (user_id, workout_date) WHERE status IN ('planned', 'in_progress') DO NOTHING
    RETURNING id`
  if (w) return w.id
  ;[w] = await find() // another request created it at the same moment
  return w.id
}

/** Names the workout after its muscle groups, e.g. "Chest & Arms" or "Legs Day". */
export async function renameWorkout(sql, workoutId) {
  await sql`
    UPDATE workouts w SET name = sub.name
    FROM (
      SELECT CASE count(DISTINCT e.muscle_group)
               WHEN 0 THEN 'Today''s Workout'
               WHEN 1 THEN min(e.muscle_group) || ' Day'
               WHEN 2 THEN min(e.muscle_group) || ' & ' || max(e.muscle_group)
               ELSE 'Full Body Blast'
             END AS name
      FROM workout_exercises we
      JOIN exercises e ON e.id = we.exercise_id
      WHERE we.workout_id = ${workoutId}
    ) sub
    WHERE w.id = ${workoutId}`
}

/** Rough session length: ~40 s per set plus the prescribed rest. */
export function estimateMinutes(exercises) {
  const sec = exercises.reduce((s, e) => s + e.sets * (40 + e.restSeconds), 0)
  return Math.max(5, Math.round(sec / 60))
}

/** Current and best run of consecutive days with a completed workout. */
export async function streaks(sql, userId, tz, today) {
  const rows = await sql`
    SELECT DISTINCT (completed_at AT TIME ZONE ${tz}::text)::date::text AS day
    FROM workouts
    WHERE user_id = ${userId} AND status = 'completed' AND completed_at IS NOT NULL
    ORDER BY day DESC
    LIMIT 400`
  return computeStreaks(rows.map((r) => r.day), today)
}

/**
 * Pure streak math over YYYY-MM-DD strings (duplicates and any order are fine).
 * The current streak stays alive if you trained yesterday but not yet today.
 */
export function computeStreaks(dayList, today) {
  const days = new Set(dayList)

  let cursor = days.has(today) ? today : addDays(today, -1)
  let current = 0
  while (days.has(cursor)) {
    current++
    cursor = addDays(cursor, -1)
  }

  let best = 0
  let run = 0
  let prev = null
  for (const day of [...days].sort()) {
    if (day > today) continue
    run = prev && addDays(prev, 1) === day ? run + 1 : 1
    best = Math.max(best, run)
    prev = day
  }
  return { current, best: Math.max(best, current) }
}

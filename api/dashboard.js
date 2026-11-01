import { db } from './_lib/db.js'
import { requireUserId } from './_lib/auth.js'
import { HttpError, route } from './_lib/http.js'
import { addDays, getTimeZone, localDate, weekStart, weekdayShort } from './_lib/time.js'
import { estimateMinutes, findTodayWorkout, streaks } from './_lib/workouts.js'

export default route({
  async GET(req, res) {
    const userId = await requireUserId(req)
    const tz = getTimeZone(req)
    const today = localDate(tz)
    const monday = weekStart(today)
    const from = [addDays(today, -13), monday].sort()[0] // covers last 14 days and this week
    const sql = db()

    const [user] = await sql`
      SELECT full_name, weekly_goal_workouts, weekly_goal_minutes FROM users WHERE id = ${userId}`
    if (!user) throw new HttpError(401, 'Please log in to continue.', 'unauthorized')

    const [workout, dayRows, streak, [nextClass]] = await Promise.all([
      findTodayWorkout(sql, userId, today),
      sql`
        SELECT (completed_at AT TIME ZONE ${tz}::text)::date::text AS day,
               COALESCE(sum(duration_minutes), 0)::int AS minutes,
               count(*)::int AS workouts
        FROM workouts
        WHERE user_id = ${userId} AND status = 'completed'
          AND completed_at >= (${from}::date)::timestamp AT TIME ZONE ${tz}::text
        GROUP BY 1`,
      streaks(sql, userId, tz, today),
      sql`
        SELECT id, title, coach_name AS "coachName", start_time AS "startTime",
               duration_minutes AS "durationMinutes", capacity, intensity
        FROM classes WHERE start_time > now() ORDER BY start_time LIMIT 1`,
    ])

    const byDay = Object.fromEntries(dayRows.map((r) => [r.day, r]))
    const activity = Array.from({ length: 7 }, (_, i) => {
      const date = addDays(today, i - 6)
      return { date, day: weekdayShort(date), minutes: byDay[date]?.minutes ?? 0, workouts: byDay[date]?.workouts ?? 0 }
    })
    const sumDays = (start, endExclusive) =>
      dayRows.filter((r) => r.day >= start && r.day < endExclusive).reduce(
        (acc, r) => ({ minutes: acc.minutes + r.minutes, workouts: acc.workouts + r.workouts }),
        { minutes: 0, workouts: 0 },
      )
    const tomorrow = addDays(today, 1)
    const week = sumDays(monday, tomorrow)
    const last7 = sumDays(addDays(today, -6), tomorrow).minutes
    const prev7 = sumDays(addDays(today, -13), addDays(today, -6)).minutes

    const trainedToday = (byDay[today]?.workouts ?? 0) > 0
    const goalsHit =
      Number(week.workouts >= user.weekly_goal_workouts) + Number(week.minutes >= user.weekly_goal_minutes) + Number(trainedToday)

    let todaySummary = null
    if (workout) {
      const totalSets = workout.exercises.reduce((s, e) => s + e.setsDetail.length, 0)
      const doneSets = workout.exercises.reduce((s, e) => s + e.setsDetail.filter((x) => x.completed).length, 0)
      todaySummary = {
        id: workout.id,
        name: workout.name,
        status: workout.status,
        durationMinutes: workout.durationMinutes,
        estimatedMinutes: estimateMinutes(workout.exercises),
        muscleGroups: [...new Set(workout.exercises.map((e) => e.muscleGroup))],
        totalSets,
        doneSets,
        exercises: workout.exercises.map((e) => ({ id: e.workoutExerciseId, name: e.name, sets: e.sets, reps: e.reps })),
      }
    }

    res.status(200).json({
      firstName: user.full_name.split(' ')[0],
      today: todaySummary ?? null,
      activity,
      activityTrend: { last7, prev7 },
      streak,
      rings: {
        workouts: { value: week.workouts, goal: user.weekly_goal_workouts },
        minutes: { value: week.minutes, goal: user.weekly_goal_minutes },
        goals: { value: goalsHit, goal: 3 },
      },
      nextClass: nextClass ?? null,
    })
  },
})

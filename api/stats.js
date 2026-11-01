import { db } from './_lib/db.js'
import { route } from './_lib/http.js'
import { addDays, getTimeZone, localDate } from './_lib/time.js'

// Public community numbers for the landing page.
export default route({
  async GET(req, res) {
    const tz = getTimeZone(req)
    const today = localDate(tz)
    const end = addDays(today, 7)
    const sql = db()
    const [row] = await sql`
      SELECT
        (SELECT count(*)::int FROM users) AS members,
        (SELECT count(*)::int FROM workouts WHERE status = 'completed') AS "workoutsCompleted",
        (SELECT count(*)::int FROM classes
          WHERE start_time >= (${today}::date)::timestamp AT TIME ZONE ${tz}::text
            AND start_time <  (${end}::date)::timestamp AT TIME ZONE ${tz}::text) AS "classesThisWeek"`
    res.status(200).json(row)
  },
})

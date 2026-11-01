import { db } from './_lib/db.js'
import { HttpError, route } from './_lib/http.js'

const GROUPS = ['Chest', 'Back', 'Legs', 'Arms', 'Core', 'Cardio']

export default route({
  async GET(req, res) {
    const group = req.query?.group
    if (group && group !== 'All' && !GROUPS.includes(group)) {
      throw new HttpError(400, `Unknown muscle group. Try one of: ${GROUPS.join(', ')}.`, 'bad_group')
    }
    const sql = db()
    const exercises =
      group && group !== 'All'
        ? await sql`
            SELECT id, name, muscle_group AS "muscleGroup", sets, reps, difficulty,
                   rest_seconds AS "restSeconds", description
            FROM exercises WHERE muscle_group = ${group} ORDER BY name`
        : await sql`
            SELECT id, name, muscle_group AS "muscleGroup", sets, reps, difficulty,
                   rest_seconds AS "restSeconds", description
            FROM exercises
            ORDER BY array_position(ARRAY['Chest','Back','Legs','Arms','Core','Cardio'], muscle_group), name`
    res.status(200).json({ exercises })
  },
})

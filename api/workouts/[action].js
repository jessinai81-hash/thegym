// One serverless function for /api/workouts/add-exercise, /remove-exercise, /start and /complete.
// Vercel's Hobby plan allows at most 12 functions per deployment, so these share one entry point;
// the handlers live in ./_actions (the "_" prefix keeps Vercel from deploying them separately).
import addExercise from './_actions/add-exercise.js'
import removeExercise from './_actions/remove-exercise.js'
import start from './_actions/start.js'
import complete from './_actions/complete.js'

const actions = {
  'add-exercise': addExercise,
  'remove-exercise': removeExercise,
  start,
  complete,
}

export default function handler(req, res) {
  const run = Object.hasOwn(actions, req.query?.action) ? actions[req.query.action] : null
  if (!run) return res.status(404).json({ error: 'not_found', message: 'That API route does not exist.' })
  return run(req, res)
}

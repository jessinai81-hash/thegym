// Local development: one command runs the /api functions (Express) and the Vite frontend.
// Vite proxies /api to the Express server (see vite.config.js).
import { createServer as createViteServer } from 'vite'
import { createApp } from './app.js'
import { ensureEnv, root } from './env.js'

const API_PORT = Number(process.env.API_PORT ?? 3001)

ensureEnv()

const app = await createApp()
await new Promise((resolve, reject) => {
  const server = app.listen(API_PORT, '127.0.0.1', resolve)
  server.on('error', reject)
})
console.log(`\n  API  ready on http://127.0.0.1:${API_PORT} (${app.locals.routeCount} routes from /api)`)

const vite = await createViteServer({ root })
await vite.listen()
vite.printUrls()

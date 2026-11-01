// Builds an Express app that serves every file in /api exactly as Vercel routes it, e.g.
//   api/auth/login.js     -> /api/auth/login
//   api/workouts/index.js -> /api/workouts
// Files and folders starting with "_" (like api/_lib) are helpers, not routes — same rule as Vercel.
// Used by the local dev server and by the backend tests.
import { readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import express from 'express'
import { root } from './env.js'

const apiDir = path.join(root, 'api')

export function collectRoutes(dir = apiDir, base = '/api') {
  const routes = []
  for (const name of readdirSync(dir)) {
    if (name.startsWith('_') || name.startsWith('.')) continue
    const full = path.join(dir, name)
    if (statSync(full).isDirectory()) {
      routes.push(...collectRoutes(full, `${base}/${name}`))
    } else if (name.endsWith('.js')) {
      const stem = name.slice(0, -3)
      const segment = stem === 'index' ? '' : `/${stem.replace(/^\[(.+)\]$/, ':$1')}`
      routes.push({ route: `${base}${segment}` || '/', file: full })
    }
  }
  return routes
}

export async function createApp() {
  const app = express()
  app.disable('x-powered-by')
  app.use(express.json({ limit: '100kb' }))

  const routes = collectRoutes()
  for (const { route, file } of routes) {
    const { default: handler } = await import(pathToFileURL(file).href)
    app.all(route, (req, res, next) => {
      Object.assign(req.query, req.params) // Vercel exposes dynamic segments on req.query
      Promise.resolve(handler(req, res)).catch(next)
    })
  }

  app.use('/api', (req, res) => res.status(404).json({ error: 'not_found', message: 'That API route does not exist.' }))
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'bad_json', message: 'The request body was not valid JSON.' })
    }
    console.error(err)
    res.status(500).json({ error: 'server_error', message: 'Something went wrong on our side. Please try again.' })
  })

  app.locals.routeCount = routes.length
  return app
}

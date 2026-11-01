// Shared request/response helpers for every /api function.
// Only uses the parts of req/res that both Vercel and the local Express server provide.

export class HttpError extends Error {
  constructor(status, message, code = 'error') {
    super(message)
    this.status = status
    this.code = code
  }
}

export function readBody(req) {
  if (req.body == null || req.body === '') return {}
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body)
    } catch {
      throw new HttpError(400, 'The request body was not valid JSON.', 'bad_json')
    }
  }
  return req.body
}

export function toInt(value, field) {
  // Only real numbers or digit strings: Number(true) === 1 must not sneak through as an id.
  const ok = (typeof value === 'number' || (typeof value === 'string' && /^\d+$/.test(value))) && Number.isSafeInteger(Number(value))
  const n = Number(value)
  if (!ok || n <= 0) throw new HttpError(400, `"${field}" must be a positive whole number.`, 'bad_request')
  return n
}

// Postgres error codes that mean "can't connect / not allowed in", not "your query is wrong".
const CONNECTION_CODES = /^(08|28|3D|53|57P0)/

function describeDbError(err) {
  const text = `${err?.message ?? ''} ${err?.cause?.message ?? ''}`
  if (err?.code === '42P01') {
    return { status: 503, code: 'db_not_setup', message: 'The database tables aren’t set up yet. Run “npm run db:setup” and try again.' }
  }
  if (
    (typeof err?.code === 'string' && CONNECTION_CODES.test(err.code)) ||
    /fetch failed|ENOTFOUND|ECONNREFUSED|ECONNRESET|ETIMEDOUT|getaddrinfo|Error connecting to database|password authentication/i.test(text)
  ) {
    return {
      status: 503,
      code: 'db_unreachable',
      message: 'We can’t reach the database right now. Check your internet connection and DATABASE_URL, then try again.',
    }
  }
  return null
}

/** Wraps per-method handlers with method checks and consistent JSON errors. */
export function route(handlers) {
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store')
    const fn = handlers[req.method]
    if (!fn) {
      res.setHeader('Allow', Object.keys(handlers).join(', '))
      return res.status(405).json({ error: 'method_not_allowed', message: `${req.method} is not supported here.` })
    }
    try {
      await fn(req, res)
    } catch (err) {
      if (err instanceof HttpError) {
        return res.status(err.status).json({ error: err.code, message: err.message })
      }
      const db = describeDbError(err)
      if (db) {
        console.error(`[api] ${db.code}:`, err.message)
        return res.status(db.status).json({ error: db.code, message: db.message })
      }
      console.error('[api] unexpected error:', err)
      return res.status(500).json({ error: 'server_error', message: 'Something went wrong on our side. Please try again.' })
    }
  }
}

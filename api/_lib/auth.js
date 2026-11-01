import { SignJWT, jwtVerify } from 'jose'
import { HttpError } from './http.js'

const COOKIE = 'pf_session'
const MAX_AGE = 60 * 60 * 24 * 7 // 7 days

function secret() {
  const s = process.env.JWT_SECRET
  if (!s || s.length < 32) {
    throw new HttpError(500, 'Login is not configured on the server (JWT_SECRET is missing).', 'auth_not_configured')
  }
  return new TextEncoder().encode(s)
}

// Readable by the page but holds no secret: it only tells the app a session *might* exist, so
// logged-out visitors don't fire a /api/auth/me request that the browser would log as a 401 error.
const HINT_COOKIE = 'pf_logged_in'

function cookie(value, maxAge, { httpOnly = true, name = COOKIE } = {}) {
  const parts = [`${name}=${value}`, 'Path=/', ...(httpOnly ? ['HttpOnly'] : []), 'SameSite=Lax', `Max-Age=${maxAge}`]
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') parts.push('Secure')
  return parts.join('; ')
}

function readCookie(req, name) {
  const header = req.headers?.cookie ?? ''
  for (const part of header.split(';')) {
    const i = part.indexOf('=')
    if (i > -1 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim())
  }
  return null
}

export async function setSession(res, userId) {
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(userId))
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret())
  res.setHeader('Set-Cookie', [cookie(token, MAX_AGE), cookie('1', MAX_AGE, { httpOnly: false, name: HINT_COOKIE })])
}

export function clearSession(res) {
  res.setHeader('Set-Cookie', [cookie('', 0), cookie('', 0, { httpOnly: false, name: HINT_COOKIE })])
}

/** Returns the logged-in user's id, or null. */
export async function getUserId(req) {
  const token = readCookie(req, COOKIE)
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ['HS256'] })
    const id = Number(payload.sub)
    return Number.isInteger(id) && id > 0 ? id : null
  } catch {
    return null
  }
}

export async function requireUserId(req) {
  const id = await getUserId(req)
  if (!id) throw new HttpError(401, 'Please log in to continue.', 'unauthorized')
  return id
}

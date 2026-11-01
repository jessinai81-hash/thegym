// Tiny client for our own /api functions. The browser never talks to the database directly.

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message)
    this.status = status
    this.code = code
  }
}

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

export async function api(path, { method = 'GET', body } = {}) {
  let res
  try {
    res = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin',
      headers: { 'x-timezone': timeZone, ...(body !== undefined ? { 'content-type': 'application/json' } : {}) },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('Can’t reach the PulseFit server. Check your connection and try again.', 0, 'network')
  }

  let data = null
  try {
    data = await res.json()
  } catch {
    /* empty or non-JSON body */
  }

  if (!res.ok) {
    if (!data) {
      // The dev proxy answers with an empty 5xx when the API server isn't running.
      throw new ApiError('Can’t reach the PulseFit server. Is “npm run dev” still running?', res.status, 'network')
    }
    if (res.status === 401 && !path.startsWith('/auth/')) window.dispatchEvent(new Event('pulsefit:unauthorized'))
    throw new ApiError(data.message ?? `Request failed (${res.status})`, res.status, data.error)
  }
  return data
}

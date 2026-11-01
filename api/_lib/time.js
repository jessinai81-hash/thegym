// "Today" and "this week" depend on where the user is, so the browser sends its IANA
// time zone in an x-timezone header. Dates are passed around as YYYY-MM-DD strings.

export function getTimeZone(req) {
  const tz = req.headers?.['x-timezone']
  if (typeof tz === 'string' && tz.length < 64) {
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: tz })
      return tz
    } catch {
      /* fall through */
    }
  }
  return 'UTC'
}

export function localDate(tz, d = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d)
}

export function addDays(date, n) {
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

/** Monday of the week containing `date`. */
export function weekStart(date) {
  const dow = (new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7
  return addDays(date, -dow)
}

export function weekdayShort(date) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })
}

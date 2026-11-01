export function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  return ((parts[0][0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

export function firstName(name = '') {
  return name.trim().split(/\s+/)[0] ?? ''
}

export function plural(n, word) {
  return `${n} ${word}${n === 1 ? '' : 's'}`
}

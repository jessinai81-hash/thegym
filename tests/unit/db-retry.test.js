import { afterEach, describe, expect, it, vi } from 'vitest'
import { neonConfig } from '@neondatabase/serverless'
import '../../api/_lib/db.js'

describe('database connection retry', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('retries a dropped connection and then succeeds', async () => {
    const ok = new Response('{}')
    const fetchMock = vi.fn().mockRejectedValueOnce(new TypeError('fetch failed')).mockResolvedValueOnce(ok)
    vi.stubGlobal('fetch', fetchMock)
    await expect(neonConfig.fetchFunction('https://example.test', {})).resolves.toBe(ok)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('gives up after 3 attempts so a real outage still shows the friendly error', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('fetch failed'))
    vi.stubGlobal('fetch', fetchMock)
    await expect(neonConfig.fetchFunction('https://example.test', {})).rejects.toThrow('fetch failed')
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('does not retry other kinds of errors', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('aborted'))
    vi.stubGlobal('fetch', fetchMock)
    await expect(neonConfig.fetchFunction('https://example.test', {})).rejects.toThrow('aborted')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})

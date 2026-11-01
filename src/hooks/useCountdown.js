import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Wall-clock based countdown, so it stays accurate even if the tab throttles timers.
 * Calls `onDone` once when it reaches zero.
 */
export default function useCountdown(onDone) {
  const [total, setTotal] = useState(60)
  const [remaining, setRemaining] = useState(60)
  const [running, setRunning] = useState(false)
  const endAt = useRef(0)
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      const left = Math.max(0, (endAt.current - Date.now()) / 1000)
      setRemaining(left)
      if (left <= 0) {
        setRunning(false)
        doneRef.current?.()
      }
    }, 100)
    return () => clearInterval(id)
  }, [running])

  const start = useCallback((seconds) => {
    setTotal(seconds)
    setRemaining(seconds)
    endAt.current = Date.now() + seconds * 1000
    setRunning(true)
  }, [])

  const pause = useCallback(() => setRunning(false), [])

  const resume = useCallback(() => {
    if (remaining <= 0) return
    endAt.current = Date.now() + remaining * 1000
    setRunning(true)
  }, [remaining])

  const add = useCallback(
    (seconds) => {
      setTotal((t) => t + seconds)
      setRemaining((r) => r + seconds)
      if (running) endAt.current += seconds * 1000
    },
    [running],
  )

  const reset = useCallback((seconds) => {
    setRunning(false)
    setTotal(seconds)
    setRemaining(seconds)
  }, [])

  return { total, remaining, running, start, pause, resume, add, reset }
}

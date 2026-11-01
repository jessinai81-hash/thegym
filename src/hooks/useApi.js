import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../lib/api.js'

/** Loads GET `path` on mount. `setData` allows optimistic local updates. */
export default function useApi(path) {
  const [state, setState] = useState({ data: null, error: null, loading: true })
  const requestId = useRef(0)

  const reload = useCallback(async () => {
    const id = ++requestId.current
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const data = await api(path)
      if (id === requestId.current) setState({ data, error: null, loading: false })
    } catch (error) {
      if (id === requestId.current) setState({ data: null, error, loading: false })
    }
  }, [path])

  useEffect(() => {
    reload()
    return () => {
      requestId.current++ // ignore responses that arrive after unmount
    }
  }, [reload])

  const setData = useCallback(
    (updater) => setState((s) => ({ ...s, data: typeof updater === 'function' ? updater(s.data) : updater })),
    [],
  )

  return { ...state, reload, setData }
}

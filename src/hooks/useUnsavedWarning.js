import { useEffect } from 'react'

/** While `active`, the browser asks before the tab is closed or reloaded (so in-flight saves aren't lost). */
export default function useUnsavedWarning(active) {
  useEffect(() => {
    if (!active) return
    const onBeforeUnload = (e) => {
      e.preventDefault()
      e.returnValue = '' // required for Chrome to show the prompt
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [active])
}

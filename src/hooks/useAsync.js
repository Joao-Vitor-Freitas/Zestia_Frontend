import { useCallback, useEffect, useState } from 'react'
export function useAsync(fn, deps) {
  const [s, set] = useState({ data: null, loading: true, error: null })
  const run = useCallback(() => {
    set(x => ({ ...x, loading: true, error: null }))
    fn().then(data => set({ data, loading: false, error: null })).catch(e => set({ data: null, loading: false, error: e.message }))
  }, deps)
  useEffect(run, [run])
  return { ...s, reload: run }
}

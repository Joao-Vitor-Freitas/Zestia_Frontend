import { useCallback, useEffect, useRef, useState } from 'react'
// Ignora respostas antigas (evita que uma requisição lenta sobrescreva uma mais nova).
export function useAsync(fn, deps) {
  const [s, set] = useState({ data: null, loading: true, error: null })
  const seq = useRef(0)
  const run = useCallback(() => {
    const id = ++seq.current
    set(x => ({ ...x, loading: true, error: null }))
    fn().then(data => id === seq.current && set({ data, loading: false, error: null }))
      .catch(e => id === seq.current && set({ data: null, loading: false, error: e.message }))
  }, deps)
  useEffect(run, [run])
  useEffect(() => () => { seq.current = -1 }, [])
  useEffect(() => { // recarrega ao voltar para a janela (dados de outras organizações)
    const f = () => document.visibilityState === 'visible' && run()
    window.addEventListener('focus', f)
    return () => window.removeEventListener('focus', f)
  }, [run])
  return { ...s, reload: run }
}

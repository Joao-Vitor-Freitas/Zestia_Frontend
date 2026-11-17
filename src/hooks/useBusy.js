import { useRef, useState } from 'react'

export function useBusy() {
  const lock = useRef(false)
  const [busy, setBusy] = useState(false)
  const run = async fn => {
    if (lock.current) return
    lock.current = true
    setBusy(true)
    try {
      return await fn()
    } finally {
      lock.current = false
      setBusy(false)
    }
  }
  return [busy, run]
}

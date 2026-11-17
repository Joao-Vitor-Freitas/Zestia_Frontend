import { useEffect, useRef } from 'react'
export default function Modal({ title, onClose, children }) {
  const ref = useRef()
  useEffect(() => {
    const k = e => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', k)
    ref.current?.querySelector('input,select,button')?.focus()
    return () => document.removeEventListener('keydown', k)
  }, [])
  return (
    <div className="modal-bg" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="mt" ref={ref}>
        <h2 id="mt">{title}</h2>{children}
      </div>
    </div>
  )
}

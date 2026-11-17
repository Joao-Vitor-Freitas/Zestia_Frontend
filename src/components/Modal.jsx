import { useEffect, useRef } from 'react'
const FOCUSABLE = 'input,select,textarea,button,[href]'
export default function Modal({ title, onClose, children }) {
  const ref = useRef()
  useEffect(() => {
    const prev = document.activeElement
    const items = () => [...ref.current.querySelectorAll(FOCUSABLE)].filter(x => !x.disabled)
    const k = e => {
      if (e.key === 'Escape') return onClose()
      if (e.key !== 'Tab') return
      const f = items(), first = f[0], last = f[f.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', k)
    items()[0]?.focus()
    return () => {
      document.removeEventListener('keydown', k)
      // devolve o foco ao botão de origem; se ele sumiu, vai para o conteúdo principal
      setTimeout(() => (prev?.isConnected ? prev : document.getElementById('main'))?.focus(), 0)
    }
  }, [])
  return (
    <div className="modal-bg" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="mt" ref={ref}>
        <h2 id="mt">{title}</h2>{children}
      </div>
    </div>
  )
}

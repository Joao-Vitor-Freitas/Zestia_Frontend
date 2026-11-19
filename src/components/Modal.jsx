import { useEffect, useId, useRef } from 'react'
import Icon from './Icon'
const FOCUSABLE = 'input,select,textarea,button,[href]'
export default function Modal({ title, onClose, children }) {
  const ref = useRef(), id = useId()
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
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', k)
      document.body.style.overflow = overflow
      // devolve o foco ao botão de origem; se ele sumiu, vai para o conteúdo principal
      setTimeout(() => (prev?.isConnected ? prev : document.getElementById('main'))?.focus(), 0)
    }
  }, [])
  return (
    <div className="modal-bg" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby={id} ref={ref}>
        <h2 id={id} className="mb-4 pr-10">{title}</h2>
        {children}
        {/* último na ordem de tabulação: o foco inicial vai para o primeiro campo */}
        <button type="button" className="icon-btn absolute right-3 top-3" aria-label="Fechar" onClick={onClose}><Icon name="x" /></button>
      </div>
    </div>
  )
}

import { useId } from 'react'
import Icon from './Icon'

// Rótulo visível sempre associado ao campo; dica e erro ligados por aria-describedby.
export default function Field({ label, error, hint, as: T = 'input', className = '', children, ...p }) {
  const id = useId()
  const desc = [hint && id + 'h', error && id + 'e'].filter(Boolean).join(' ') || undefined
  return (
    <div className={`field ${className}`}>
      <label htmlFor={id}>{label}</label>
      <T id={id} aria-invalid={error ? true : undefined} aria-describedby={desc} {...p}>{children}</T>
      {hint && <p id={id + 'h'} className="hint">{hint}</p>}
      {error && <p id={id + 'e'} className="field-error"><Icon name="alert" size={16} />{error}</p>}
    </div>
  )
}

// Após validar, leva o foco ao primeiro campo com erro (o leitor de tela lê o rótulo e a mensagem).
export const focusFirstInvalid = el => setTimeout(() => el?.querySelector('[aria-invalid="true"]')?.focus(), 0)

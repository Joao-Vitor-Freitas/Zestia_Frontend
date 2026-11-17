import { useId } from 'react'

export default function Field({ label, error, as: T = 'input', children, ...p }) {
  const id = useId()
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <T id={id} aria-invalid={!!error} aria-describedby={error ? id + 'e' : undefined} {...p}>{children}</T>
      {error && <small id={id + 'e'} role="alert">{error}</small>}
    </div>
  )
}

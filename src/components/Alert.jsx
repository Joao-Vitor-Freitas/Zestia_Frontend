export default function Alert({ type = 'ok', children }) {
  return <div role={type === 'error' ? 'alert' : 'status'} className={`alert ${type}`}>{children}</div>
}

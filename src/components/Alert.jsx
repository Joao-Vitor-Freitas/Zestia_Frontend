import Icon from './Icon'
export default function Alert({ type = 'ok', children }) {
  return (
    <div role={type === 'error' ? 'alert' : 'status'} className={`alert ${type}`}>
      <Icon name={type === 'error' ? 'alert' : 'check'} className="mt-0.5" />
      <div>{children}</div>
    </div>
  )
}

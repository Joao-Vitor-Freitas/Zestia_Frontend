import Alert from './Alert'
import Button from './Button'

export default function AsyncView({ data, loading, error, empty, emptyText, onRetry, children }) {
  if (loading && !data) {
    return (
      <div className="grid" role="status" aria-busy="true">
        <span className="sr-only">Carregando…</span>
        {[0, 1, 2].map(i => (
          <div key={i} className="card h-64 animate-pulse bg-white/80" />
        ))}
      </div>
    )
  }
  if (error) {
    return (
      <div className="space-y-3">
        <Alert type="error">{error}</Alert>
        <Button variant="sec" onClick={onRetry}>Tentar novamente</Button>
      </div>
    )
  }
  if (empty) return <p className="empty">{emptyText}</p>
  return <div aria-busy={loading} className={loading ? 'opacity-60 transition-opacity' : ''}>{children}</div>
}

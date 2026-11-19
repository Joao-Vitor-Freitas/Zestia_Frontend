import Alert from './Alert'
import Button from './Button'
// Estados: carregando (esqueleto), erro e vazio. Em recargas mantém os dados antigos na tela, levemente esmaecidos.
export default function AsyncView({ data, loading, error, empty, emptyText, onRetry, children }) {
  if (loading && !data) return (
    <div className="grid-cards" role="status" aria-busy="true">
      <span className="sr-only">Carregando…</span>
      {[0, 1, 2].map(i => <div key={i} className="card h-64 bg-line/60 motion-safe:animate-pulse" />)}
    </div>
  )
  if (error) return <div><Alert type="error">{error}</Alert><Button variant="sec" onClick={onRetry}>Tentar novamente</Button></div>
  if (empty) return <div className="empty">{emptyText}</div>
  return <div aria-busy={loading} className={loading ? 'opacity-60 transition-opacity' : ''}>{children}</div>
}

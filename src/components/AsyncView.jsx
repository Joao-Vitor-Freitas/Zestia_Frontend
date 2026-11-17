import Alert from './Alert'
import Button from './Button'
// Estados: carregando (esqueleto), erro e vazio. Em recargas mantém os dados antigos na tela, levemente esmaecidos.
export default function AsyncView({ data, loading, error, empty, emptyText, onRetry, children }) {
  if (loading && !data) return (
    <div className="grid" role="status" aria-busy="true">
      <span className="sr-only">Carregando…</span>
      {[0, 1, 2].map(i => <div key={i} className="card h-48 animate-pulse bg-slate-100" />)}
    </div>
  )
  if (error) return <div><Alert type="error">{error}</Alert><Button variant="sec" onClick={onRetry}>Tentar novamente</Button></div>
  if (empty) return <p className="empty">{emptyText}</p>
  return <div aria-busy={loading} className={loading ? 'opacity-60 transition-opacity' : ''}>{children}</div>
}

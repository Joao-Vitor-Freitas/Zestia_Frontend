import Alert from './Alert'
import Button from './Button'
// Padroniza os estados: carregando, erro e vazio. Sucesso é exibido pelo toast global.
export default function AsyncView({ loading, error, empty, emptyText, onRetry, children }) {
  if (loading) return <p className="load" role="status">Carregando…</p>
  if (error) return <div><Alert type="error">{error}</Alert><Button variant="sec" onClick={onRetry}>Tentar novamente</Button></div>
  if (empty) return <p className="empty">{emptyText}</p>
  return children
}

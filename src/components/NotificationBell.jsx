import { useApp } from '../context'
import { useAsync } from '../hooks/useAsync'
import { getAll } from '../services/data'
import Icon from './Icon'

// Sino do guia (Explorar doações): ponto vermelho quando há pedidos aguardando a aprovação da organização.
export default function NotificationBell({ go }) {
  const { orgId, msg } = useApp()
  const { data } = useAsync(() => getAll('/requests?status=PENDING'), [orgId, msg])
  const n = (data || []).filter(r => r.donorOrganizationId === orgId).length
  const label = n ? `Notificações: ${n} ${n === 1 ? 'pedido aguarda' : 'pedidos aguardam'} sua aprovação` : 'Notificações: nenhum pedido aguardando'
  return (
    <button type="button" className="icon-btn relative h-12 w-12 border border-line-strong bg-surface" aria-label={label} onClick={() => go('approvals')}>
      <Icon name="bell" size={20} />
      {n > 0 && <span aria-hidden="true" className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-urgent-fg ring-2 ring-surface" />}
    </button>
  )
}

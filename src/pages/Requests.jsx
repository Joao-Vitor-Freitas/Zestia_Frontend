import { useState } from 'react'
import { api } from '../services/api'
import { useApp } from '../context'
import { useAsync } from '../hooks/useAsync'
import AsyncView from '../components/AsyncView'
import StatusBadge from '../components/StatusBadge'
import Button from '../components/Button'

export default function Requests() {
  const { orgId, notify } = useApp()
  const [tab, setTab] = useState('received')
  const { data, loading, error, reload } = useAsync(() => api.get('/requests'), [orgId])
  const sent = tab === 'sent'
  const list = (data || []).filter(r => (sent ? r.recipientOrganizationId : r.donorOrganizationId) === orgId)
  const act = async (r, a) => {
    try { await api.post(`/requests/${r.id}/${a}`); notify(a === 'approve' ? 'Solicitação aprovada.' : 'Solicitação rejeitada.'); reload() } catch (x) { notify(x.message, 'error') }
  }
  return (
    <>
      <h1>Solicitações</h1>
      <div className="row">
        <Button variant={sent ? 'sec' : ''} aria-pressed={!sent} onClick={() => setTab('received')}>Recebidas</Button>
        <Button variant={sent ? '' : 'sec'} aria-pressed={sent} onClick={() => setTab('sent')}>Enviadas</Button>
      </div>
      <AsyncView loading={loading} error={error} onRetry={reload} empty={!list.length} emptyText="Nenhuma solicitação por aqui.">
        <div className="scroll">
          <table>
            <thead><tr><th>Alimento</th><th>{sent ? 'Doadora' : 'Solicitante'}</th><th>Qtd.</th><th>Status</th><th>Data</th><th>Ações</th></tr></thead>
            <tbody>
              {list.map(r => (
                <tr key={r.id}>
                  <td>{r.foodName}</td><td>{sent ? r.donorName : r.recipientName}</td><td>{r.quantityKg} kg</td>
                  <td><StatusBadge status={r.status} /></td><td>{new Date(r.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td>{!sent && r.status === 'PENDING' && <div className="row"><Button onClick={() => act(r, 'approve')}>Aprovar</Button><Button variant="del" onClick={() => act(r, 'reject')}>Rejeitar</Button></div>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AsyncView>
    </>
  )
}

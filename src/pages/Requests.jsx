import { useState } from 'react'
import { api } from '../services/api'
import { useApp } from '../context'
import { useAsync } from '../hooks/useAsync'
import { useBusy } from '../hooks/useBusy'
import AsyncView from '../components/AsyncView'
import StatusBadge from '../components/StatusBadge'
import Button from '../components/Button'

export default function Requests() {
  const { orgId, notify, refreshPending } = useApp()
  const [busy, run] = useBusy()
  const [tab, setTab] = useState('received')
  const { data, loading, error, reload } = useAsync(() => api.get('/requests'), [orgId])

  const sent = tab === 'sent'
  const list = (data || [])
    .filter(r => (sent ? r.recipientOrganizationId : r.donorOrganizationId) === orgId)
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))

  const act = async (r, a) => {
    await run(async () => {
      try {
        await api.post(`/requests/${r.id}/${a}`)
        notify(a === 'approve' ? 'Solicitação aprovada.' : 'Solicitação rejeitada.')
        reload()
        refreshPending(orgId)
      } catch (x) {
        notify(x.message, 'error')
      }
    })
  }

  return (
    <>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="mb-1">Solicitações</h1>
          <p className="text-sm text-muted">
            Revise pedidos recebidos nos seus lotes ou acompanhe suas retiradas solicitadas
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant={sent ? 'sec' : ''} aria-pressed={!sent} onClick={() => setTab('received')}>
            Recebidas
          </Button>
          <Button variant={sent ? '' : 'sec'} aria-pressed={sent} onClick={() => setTab('sent')}>
            Enviadas
          </Button>
          <Button variant="sec" aria-label="Atualizar lista" onClick={() => { reload(); refreshPending(orgId) }}>
            Atualizar
          </Button>
        </div>
      </div>

      <AsyncView
        data={data}
        loading={loading}
        error={error}
        onRetry={reload}
        empty={!list.length}
        emptyText="Nenhuma solicitação por aqui."
      >
        <div className="scroll shadow-card">
          <table>
            <caption className="sr-only">Solicitações {sent ? 'enviadas' : 'recebidas'}</caption>
            <thead>
              <tr>
                <th>Alimento</th>
                <th>{sent ? 'Doadora' : 'Solicitante'}</th>
                <th>Qtd.</th>
                <th>Status</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {list.map(r => (
                <tr key={r.id} className="hover:bg-canvas/40">
                  <td className="font-semibold text-ink">{r.foodName}</td>
                  <td>{sent ? r.donorName : r.recipientName}</td>
                  <td className="font-semibold">{r.quantityKg} kg</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td className="text-muted">{new Date(r.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td>
                    {!sent && r.status === 'PENDING' && (
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          disabled={busy}
                          aria-label={`Aprovar ${r.quantityKg} kg de ${r.foodName} para ${r.recipientName}`}
                          onClick={() => act(r, 'approve')}
                        >
                          Aprovar
                        </Button>
                        <Button
                          variant="del"
                          disabled={busy}
                          aria-label={`Rejeitar ${r.quantityKg} kg de ${r.foodName} para ${r.recipientName}`}
                          onClick={() => act(r, 'reject')}
                        >
                          Rejeitar
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AsyncView>
    </>
  )
}

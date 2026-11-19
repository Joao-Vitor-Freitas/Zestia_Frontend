import { useId, useState } from 'react'
import { api } from '../services/api'
import { useApp } from '../context'
import { useAsync } from '../hooks/useAsync'
import { useBusy } from '../hooks/useBusy'
import { fmtKg, timeAgo } from '../format'
import AsyncView from '../components/AsyncView'
import PageHeader from '../components/PageHeader'
import Button from '../components/Button'
import Icon from '../components/Icon'
import { Thumb } from '../components/FoodCard'
import { Avatar, ExpirySeal, StatusBadge } from '../components/Badges'

const pendingFirst = (a, b) => (a.status !== 'PENDING') - (b.status !== 'PENDING') || (a.createdAt || '').localeCompare(b.createdAt || '')

// Requisições recebidas, agrupadas por lote (guia: p. 4 e 9).
export default function Approvals() {
  const { orgs, orgId, notify } = useApp()
  const [busy, run] = useBusy()
  const [selId, setSel] = useState(null)
  const ids = useId()
  const { data, loading, error, reload } = useAsync(() => Promise.all([api.get('/foods'), api.get('/requests')]), [orgId])
  const [foods, reqs] = data || [[], []]
  const received = reqs.filter(r => r.donorOrganizationId === orgId)
  const lots = foods.filter(f => f.donorOrganizationId === orgId)
    .map(f => { const rs = received.filter(r => r.foodId === f.id).sort(pendingFirst); return { ...f, reqs: rs, pending: rs.filter(r => r.status === 'PENDING').length } })
    .filter(l => l.reqs.length)
    .sort((a, b) => b.pending - a.pending || a.expirationDate.localeCompare(b.expirationDate))
  const cur = lots.find(l => l.id === selId) || lots[0]
  const typeOf = id => orgs.find(o => o.id === id)?.type

  const act = async (r, a) => {
    await run(async () => {
      try { await api.post(`/requests/${r.id}/${a}`); notify(a === 'approve' ? 'Requisição aprovada para retirada.' : 'Requisição recusada.'); reload() }
      catch (x) { notify(x.message, 'error') }
    })
  }

  return (
    <>
      <PageHeader title="Aprovações" sub="Revise quem pediu cada lote. A quantidade só sai do saldo depois da sua aprovação."
        actions={<Button variant="sec" aria-label="Atualizar lista" onClick={reload}><Icon name="refresh" size={18} />Atualizar</Button>} />
      <AsyncView data={data} loading={loading} error={error} onRetry={reload} empty={!lots.length} emptyText="Nenhuma requisição recebida por aqui.">
        {cur && (
          <div className="grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
            <section aria-labelledby={`${ids}l`}>
              <h2 id={`${ids}l`} className="eyebrow mb-3">Seus lotes com pedidos</h2>
              <ul className="grid gap-3">
                {lots.map(l => (
                  <li key={l.id}>
                    <button type="button" className="lot-item" aria-pressed={cur.id === l.id} onClick={() => setSel(l.id)}>
                      <span className="flex items-start justify-between gap-2">
                        <span className="font-semibold">{l.name}</span>
                        {l.pending > 0 && <span className="grid h-6 min-w-6 place-items-center rounded-full bg-urgent-fg px-1.5 text-xs font-bold text-white">{l.pending}<span className="sr-only">{l.pending === 1 ? ' pendente' : ' pendentes'}</span></span>}
                      </span>
                      <span className="mt-2 flex flex-wrap gap-1.5">
                        <ExpirySeal date={l.expirationDate} />
                        {l.pending ? <StatusBadge status="PENDING" /> : <StatusBadge status="DONE">Sem pendências</StatusBadge>}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby={`${ids}c`} className="min-w-0">
              <div className="card flex flex-wrap items-center gap-4">
                <Thumb category={cur.category} className="h-20 w-20" />
                <div className="min-w-0 flex-1">
                  <h2 id={`${ids}c`}>{cur.name}</h2>
                  <p className="mt-1 text-sm text-muted">{cur.category} · {fmtKg(cur.availableKg)} disponíveis de {fmtKg(cur.quantityKg)}</p>
                </div>
                <ExpirySeal date={cur.expirationDate} />
              </div>
              <div className="mb-3 mt-6 flex flex-wrap items-baseline justify-between gap-2">
                <h3>{cur.reqs.length} {cur.reqs.length === 1 ? 'organização pediu' : 'organizações pediram'} este lote</h3>
                <p className="text-sm text-muted">Pendentes primeiro, por ordem de chegada</p>
              </div>
              <ul className="grid gap-3">
                {cur.reqs.map(r => {
                  const what = `${fmtKg(r.quantityKg)} de ${cur.name} para ${r.recipientName}`
                  return (
                    <li key={r.id}>
                      <article aria-labelledby={`${ids}${r.id}`} className="card flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="flex min-w-0 flex-1 items-center gap-4">
                          <Avatar name={r.recipientName} type={typeOf(r.recipientOrganizationId)} />
                          <div className="min-w-0">
                            <h4 id={`${ids}${r.id}`} className="text-lg font-semibold leading-6">{r.recipientName}</h4>
                            <p className="text-sm text-muted"><strong className="font-semibold text-ink">{fmtKg(r.quantityKg)}</strong> solicitados · pedido <time dateTime={r.createdAt}>{timeAgo(r.createdAt)}</time></p>
                          </div>
                        </div>
                        {r.status === 'PENDING' ? (
                          <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
                            <Button variant="del" disabled={busy} aria-label={`Recusar ${what}`} onClick={() => act(r, 'reject')}>Recusar</Button>
                            <Button disabled={busy} aria-label={`Aprovar ${what}`} onClick={() => act(r, 'approve')}>Aprovar</Button>
                          </div>
                        ) : <StatusBadge status={r.status} />}
                      </article>
                    </li>
                  )
                })}
              </ul>
            </section>
          </div>
        )}
      </AsyncView>
    </>
  )
}

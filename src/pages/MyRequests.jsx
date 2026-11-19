import { useId } from 'react'
import { loadNetwork } from '../services/data'
import { useApp } from '../context'
import { useAsync } from '../hooks/useAsync'
import { byNewest, fmtDate, fmtKg } from '../format'
import AsyncView from '../components/AsyncView'
import PageHeader from '../components/PageHeader'
import Button from '../components/Button'
import Icon from '../components/Icon'
import { Thumb } from '../components/FoodCard'
import { ExpirySeal, StatusBadge } from '../components/Badges'

// Andamento: o estado vem em texto (e aria-current), não só na cor do marcador.
function Steps({ status }) {
  const second = status === 'APPROVED' ? ['done', 'Aprovado'] : status === 'REJECTED' ? ['rejected', 'Recusado'] : ['current', 'Em análise']
  return (
    <ol className="steps" aria-label="Andamento">
      <li data-state="done"><span className="dot" aria-hidden="true" />Requisitado<span className="sr-only"> (concluído)</span></li>
      <li data-state={second[0]} aria-current="step"><span className="dot" aria-hidden="true" />{second[1]}</li>
      {status !== 'REJECTED' && <li data-state="todo"><span className="dot" aria-hidden="true" />Retirada<span className="sr-only"> (a fazer)</span></li>}
    </ol>
  )
}

export default function MyRequests({ go }) {
  const { orgId, orgs } = useApp()
  const ids = useId()
  const { data, loading, error, reload } = useAsync(() => loadNetwork(orgs), [orgId, orgs])
  const [foods, reqs] = data || [[], []]
  const list = reqs.filter(r => r.recipientOrganizationId === orgId).sort(byNewest)
  const food = id => foods.find(f => f.id === id)
  return (
    <>
      <PageHeader title="Minhas requisições" sub="Acompanhe os lotes que sua organização pediu."
        actions={<Button variant="sec" aria-label="Atualizar lista" onClick={reload}><Icon name="refresh" size={18} />Atualizar</Button>} />
      <AsyncView data={data} loading={loading} error={error} onRetry={reload} empty={!list.length}
        emptyText={<><p>Você ainda não requisitou nenhum lote.</p><Button className="mt-4" onClick={() => go('offers')}><Icon name="compass" />Explorar doações</Button></>}>
        <ul className="grid gap-4">
          {list.map(r => {
            const f = food(r.foodId)
            return (
              <li key={r.id}>
                <article aria-labelledby={`${ids}${r.id}`} className={`card flex gap-4 ${r.status === 'APPROVED' ? 'border-primary' : ''}`}>
                  <Thumb category={f?.category} className="hidden h-20 w-20 shrink-0 sm:grid" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h2 id={`${ids}${r.id}`} className="text-lg leading-6">{r.foodName}</h2>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted">
                      {r.donorName} · <strong className="font-semibold text-ink">{fmtKg(r.quantityKg)}</strong> · pedido em <time dateTime={r.createdAt}>{fmtDate(r.createdAt)}</time>
                    </p>
                    {f && <div className="mt-2"><ExpirySeal date={f.expirationDate} /></div>}
                    <Steps status={r.status} />
                    {r.status === 'APPROVED' && (
                      <div className="info mt-4 flex-wrap items-center justify-between">
                        <p className="flex items-start gap-3"><Icon name="check" size={18} className="mt-0.5" />Aprovado! Retire com {r.donorName} antes do vencimento.</p>
                        <Button aria-label={`Ver comprovante de ${r.foodName}`} onClick={() => go('receipt', { id: r.id })}>Ver comprovante</Button>
                      </div>
                    )}
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      </AsyncView>
    </>
  )
}

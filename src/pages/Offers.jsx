import { useId, useState } from 'react'
import { api } from '../services/api'
import { loadNetwork } from '../services/data'
import { useApp } from '../context'
import { useAsync } from '../hooks/useAsync'
import { useBusy } from '../hooks/useBusy'
import { byNewest, expiry, fmtDate, fmtKg } from '../format'
import AsyncView from '../components/AsyncView'
import PageHeader from '../components/PageHeader'
import FoodCard from '../components/FoodCard'
import Field, { focusFirstInvalid } from '../components/Field'
import Button from '../components/Button'
import Modal from '../components/Modal'
import Icon from '../components/Icon'
import { ExpirySeal } from '../components/Badges'
import NotificationBell from '../components/NotificationBell'

const FILTERS = [['all', 'Todos'], ['urgent', 'Urgentes (< 24h)'], ['market', 'De mercados'], ['ngo', 'De outras ONGs']]

export default function Offers({ go }) {
  const { orgs, orgId, notify } = useApp()
  const [busy, run] = useBusy()
  const [q, setQ] = useState(''), [flt, setFlt] = useState('all'), [cat, setCat] = useState('')
  const [sel, setSel] = useState(null), [qty, setQty] = useState(''), [err, setErr] = useState('')
  const [dismissed, setDismissed] = useState(null)
  const sid = useId(), lid = useId()
  const { data, loading, error, reload } = useAsync(() => loadNetwork(orgs), [orgId, orgs])
  const [foods, reqs] = data || [[], []]
  const typeOf = id => orgs.find(o => o.id === id)?.type

  // lotes de outras organizações, com saldo e dentro da validade; os que vencem antes aparecem primeiro
  const avail = foods.filter(f => f.donorOrganizationId !== orgId && f.availableKg > 0 && !expiry(f.expirationDate).expired)
    .sort((a, b) => a.expirationDate.localeCompare(b.expirationDate))
  const cats = [...new Set(avail.map(f => f.category))].sort()
  const curCat = cats.includes(cat) ? cat : ''
  const term = q.trim().toLowerCase()
  const match = f => flt === 'all' || (flt === 'urgent' ? expiry(f.expirationDate).level === 'urgent'
    : flt === 'market' ? typeOf(f.donorOrganizationId) === 'SUPERMARKET' : typeOf(f.donorOrganizationId) !== 'SUPERMARKET')
  const list = avail.filter(f => match(f) && (!curCat || f.category === curCat) && (!term || `${f.name} ${f.donorName}`.toLowerCase().includes(term)))

  const mine = reqs.filter(r => r.recipientOrganizationId === orgId)
  const pending = new Set(mine.filter(r => r.status === 'PENDING').map(r => r.foodId))
  const approved = mine.filter(r => r.status === 'APPROVED').sort(byNewest)[0]
  const banner = approved && approved.id !== dismissed

  const open = f => { setSel(f); setQty(''); setErr('') }
  const submit = async e => {
    e.preventDefault()
    const n = Number(qty), form = e.currentTarget
    const fail = m => { setErr(m); focusFirstInvalid(form) }
    if (!(n > 0)) return fail('Informe uma quantidade maior que zero.')
    if (n > sel.availableKg) return fail(`Máximo disponível: ${fmtKg(sel.availableKg)}.`)
    await run(async () => {
      try { await api.post('/requests', { foodId: sel.id, quantityKg: n }); notify('Requisição enviada!'); setSel(null); reload() }
      catch (x) { fail(x.message) }
    })
  }

  return (
    <>
      <PageHeader
        title="Oportunidades de doação"
        sub={data ? `${avail.length} ${avail.length === 1 ? 'lote aberto' : 'lotes abertos'} na rede · atualizado agora` : 'Lotes disponíveis na rede'}
        actions={<>
          <form role="search" className="relative min-w-0 flex-1 sm:w-80 sm:flex-none" onSubmit={e => e.preventDefault()}>
            <label htmlFor={sid} className="sr-only">Buscar alimento ou doador</label>
            <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input id={sid} type="search" className="pl-11" placeholder="Buscar alimento ou doador" value={q} onChange={e => setQ(e.target.value)} />
          </form>
          <NotificationBell go={go} />
        </>}
      />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        {banner && (
          <aside aria-labelledby={`${lid}b`} className="flex items-start gap-3 rounded-2xl bg-zest p-4 text-ink xl:sticky xl:top-6 xl:order-2">
            <Icon name="check" className="mt-0.5" />
            <div className="min-w-0 flex-1">
              <h2 id={`${lid}b`} className="font-sans text-base font-bold leading-6">Requisição aprovada</h2>
              <p className="text-sm">{approved.donorName} liberou {fmtKg(approved.quantityKg)} de {approved.foodName}.</p>
              <button type="button" className="mt-2 cursor-pointer text-sm font-bold underline underline-offset-2" onClick={() => go('receipt', { id: approved.id })}>Ver comprovante</button>
            </div>
            <button type="button" className="icon-btn -m-2" aria-label="Dispensar aviso" onClick={() => setDismissed(approved.id)}><Icon name="x" size={18} /></button>
          </aside>
        )}

        <section aria-labelledby={lid} className="min-w-0">
          <h2 id={lid} className="sr-only">Lotes disponíveis</h2>
          <div className="mb-3 flex flex-wrap items-end gap-3">
            <div role="group" aria-label="Filtrar lotes" className="flex flex-wrap gap-2">
              {FILTERS.map(([k, l]) => <button key={k} type="button" className="chip" aria-pressed={flt === k} onClick={() => setFlt(k)}>{l}</button>)}
            </div>
            <div className="flex flex-wrap items-end gap-2 lg:ml-auto">
              <Field as="select" label="Categoria" className="w-48" value={curCat} onChange={e => setCat(e.target.value)}>
                <option value="">Todas</option>{cats.map(c => <option key={c} value={c}>{c}</option>)}
              </Field>
              <Button variant="sec" className="min-h-12" aria-label="Atualizar lista" onClick={reload}><Icon name="refresh" size={18} />Atualizar</Button>
            </div>
          </div>
          <p role="status" className="mb-4 text-sm text-muted">{data && `Mostrando ${list.length} de ${avail.length} ${avail.length === 1 ? 'lote' : 'lotes'}`}</p>

          <AsyncView data={data} loading={loading} error={error} onRetry={reload} empty={!list.length}
            emptyText={avail.length ? 'Nenhum lote corresponde aos filtros escolhidos.' : 'Nenhum lote disponível no momento.'}>
            <ul className="grid-cards">
              {list.map(f => (
                <li key={f.id} className="flex">
                  <FoodCard food={f} type={typeOf(f.donorOrganizationId)}>
                    {pending.has(f.id)
                      ? <Button variant="pending" className="w-full" aria-label={`Ver requisição de ${f.name}, aguardando aprovação`} onClick={() => go('sent')}><Icon name="clock" size={18} />Aguardando aprovação</Button>
                      : <Button className="w-full" aria-label={`Requisitar lote de ${f.name}`} onClick={() => open(f)}>Requisitar lote</Button>}
                  </FoodCard>
                </li>
              ))}
            </ul>
          </AsyncView>
        </section>
      </div>

      {sel && (
        <Modal title={`Requisitar lote: ${sel.name}`} onClose={() => setSel(null)}>
          <dl className="mb-5 grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl bg-canvas p-4 text-sm">
            <div className="col-span-2"><dt className="text-muted">Doador</dt><dd className="font-semibold">{sel.donorName}</dd></div>
            <div><dt className="text-muted">Disponível</dt><dd className="font-semibold">{fmtKg(sel.availableKg)}</dd></div>
            <div><dt className="text-muted">Validade</dt><dd className="font-semibold">{fmtDate(sel.expirationDate)}</dd></div>
            <div className="col-span-2"><dt className="sr-only">Prazo</dt><dd><ExpirySeal date={sel.expirationDate} /></dd></div>
          </dl>
          <form onSubmit={submit} noValidate className="grid gap-5">
            <Field label="Quantidade desejada (kg)" type="number" inputMode="decimal" min="0" step="0.001" required
              hint={`Até ${fmtKg(sel.availableKg)} (saldo estimado; se outra organização já tiver sido aprovada, o sistema avisa). O doador revisa o pedido antes de liberar a retirada.`}
              value={qty} onChange={e => setQty(e.target.value)} error={err} />
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button variant="sec" onClick={() => setSel(null)}>Cancelar</Button>
              <Button type="submit" disabled={busy}>Enviar requisição</Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}

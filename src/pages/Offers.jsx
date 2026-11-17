import { useId, useState } from 'react'
import { api } from '../services/api'
import { useApp } from '../context'
import { useAsync } from '../hooks/useAsync'
import { useBusy } from '../hooks/useBusy'
import { TYPES } from '../constants'
import AsyncView from '../components/AsyncView'
import FoodCard from '../components/FoodCard'
import Field from '../components/Field'
import Button from '../components/Button'
import Modal from '../components/Modal'
import { expiry, parseLocalExpiry } from '../components/ExpiryGauge'

export default function Offers({ setPage, onQuickDonate }) {
  const { org, orgId, notify, refreshPending } = useApp()
  const [busy, run] = useBusy()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')
  const [onlyUrgent, setOnlyUrgent] = useState(false)
  const [sel, setSel] = useState(null)
  const [qty, setQty] = useState('')
  const [err, setErr] = useState('')
  const searchId = useId()

  const { data, loading, error, reload } = useAsync(() => api.get('/foods'), [orgId])
  const { data: reqs, reload: reloadReqs } = useAsync(() => api.get('/requests'), [orgId])

  const refreshAll = () => {
    reload()
    reloadReqs()
    refreshPending(orgId)
  }

  const avail = (data || []).filter(
    f => f.donorOrganizationId !== orgId && f.availableKg > 0 && parseLocalExpiry(f.expirationDate) > new Date()
  )
  const cats = [...new Set(avail.map(f => f.category))]
  const cur = cats.includes(cat) ? cat : ''

  const list = avail.filter(f => {
    const matchCat = !cur || f.category === cur
    const matchQ = f.name.toLowerCase().includes(q.toLowerCase()) || f.donorName?.toLowerCase().includes(q.toLowerCase())
    const matchUrgent = !onlyUrgent || expiry(f.expirationDate).h < 24
    return matchCat && matchQ && matchUrgent
  })

  const open = f => {
    setSel(f)
    setQty('')
    setErr('')
  }

  const submit = async e => {
    e.preventDefault()
    const n = Number(qty)
    if (!(n > 0)) return setErr('Informe uma quantidade maior que zero.')
    if (n > sel.availableKg) return setErr(`Máximo disponível: ${sel.availableKg} kg.`)
    await run(async () => {
      try {
        await api.post('/requests', { foodId: sel.id, quantityKg: n })
        notify('Solicitação enviada!')
        setSel(null)
        refreshAll()
      } catch (x) {
        setErr(x.message)
      }
    })
  }

  const approvedMine = (reqs || [])
    .filter(r => r.recipientOrganizationId === orgId && r.status === 'APPROVED')
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
  const pendingReceived = (reqs || []).filter(r => r.donorOrganizationId === orgId && r.status === 'PENDING')
  const rescuedKg = approvedMine.reduce((acc, r) => acc + Number(r.quantityKg || 0), 0)

  return (
    <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
      <div className="min-w-0 flex-1">
        {/* Banner Zestia */}
        <div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl bg-primary p-5 text-white shadow-sm sm:flex-row sm:items-center md:p-6">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-zest">
              Rede ativa · {TYPES[org?.type]}
            </span>
            <h2 className="font-display text-xl font-bold leading-snug text-white md:text-2xl">
              {rescuedKg > 0
                ? `${org?.name} já resgatou ${Math.round(rescuedKg * 1000) / 1000} kg na rede`
                : `Conectando excedentes em tempo real`}
            </h2>
            <p className="text-xs text-white/85 md:text-sm">
              Solicite lotes próximos do vencimento ou publique excedentes da sua operação.
            </p>
          </div>
          {onQuickDonate && (
            <button
              type="button"
              onClick={onQuickDonate}
              className="btn zest shrink-0 self-start sm:self-center"
            >
              + Publicar lote
            </button>
          )}
        </div>

        <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <small className="font-semibold text-primary">
              {org?.name} · {TYPES[org?.type]} {org?.location && `· ${org.location}`}
            </small>
            <h1 className="mb-1 mt-0.5">Ofertas disponíveis</h1>
            <p className="text-sm text-muted">
              {avail.length} {avail.length === 1 ? 'lote aberto' : 'lotes abertos'} para resgate imediato
            </p>
          </div>

          <div className="w-full md:w-80">
            <label htmlFor={searchId} className="sr-only">Buscar alimento</label>
            <div className="relative flex items-center">
              <svg
                className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
              </svg>
              <input
                id={searchId}
                type="search"
                placeholder="Buscar alimento ou doador…"
                value={q}
                onChange={e => setQ(e.target.value)}
                className="h-11 w-full rounded-full border border-line bg-white pl-10 pr-9 text-sm text-ink placeholder:text-muted focus:border-primary"
              />
              {q && (
                <button
                  type="button"
                  aria-label="Limpar busca"
                  onClick={() => setQ('')}
                  className="absolute right-2.5 grid h-6 w-6 place-items-center rounded-full text-muted hover:bg-canvas hover:text-ink"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Categorias">
            {['', ...cats].map(c => (
              <button
                key={c}
                type="button"
                className="pill"
                aria-pressed={cur === c && !onlyUrgent}
                onClick={() => {
                  setCat(c)
                  setOnlyUrgent(false)
                }}
              >
                {c || 'Todas'}
              </button>
            ))}

            <button
              type="button"
              className="pill"
              aria-pressed={onlyUrgent}
              onClick={() => setOnlyUrgent(v => !v)}
            >
              Urgentes (&lt; 24h)
            </button>
          </div>

          <Button variant="sec" aria-label="Atualizar lista" onClick={refreshAll}>
            Atualizar
          </Button>
        </div>

        <AsyncView
          data={data}
          loading={loading}
          error={error}
          onRetry={refreshAll}
          empty={!list.length}
          emptyText="Nenhuma oferta disponível no momento."
        >
          <div className="grid">
            {list.map(f => (
              <FoodCard key={f.id} food={f}>
                <Button aria-label={`Solicitar doação de ${f.name}`} onClick={() => open(f)}>
                  Solicitar doação
                </Button>
              </FoodCard>
            ))}
          </div>
        </AsyncView>
      </div>

      <aside className="w-full shrink-0 space-y-4 xl:w-80">
        {approvedMine.length > 0 && (
          <div className="rounded-2xl bg-zest p-5 text-ink shadow-sm">
            <span className="inline-block rounded-full bg-ink/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider">
              Requisição aprovada!
            </span>
            <p className="mt-2 font-display text-base font-bold leading-snug">
              {approvedMine[0].donorName} liberou {approvedMine[0].quantityKg} kg de {approvedMine[0].foodName}.
            </p>
            <button
              type="button"
              onClick={() => setPage?.('requests')}
              className="mt-3 inline-flex items-center text-xs font-bold underline underline-offset-4 hover:opacity-80"
            >
              Ver em solicitações →
            </button>
          </div>
        )}

        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold">Resumo da rede</h2>
            <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-primary-dark">
              Ativo
            </span>
          </div>

          <div className="divide-y divide-line text-sm">
            <div className="flex items-center justify-between py-2.5">
              <span className="text-muted">Lotes disponíveis</span>
              <strong className="font-display text-base text-ink">{avail.length}</strong>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-muted">Pedidos aguardando você</span>
              <strong className="font-display text-base text-primary">{pendingReceived.length}</strong>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-muted">Suas retiradas aprovadas</span>
              <strong className="font-display text-base text-ink">{approvedMine.length}</strong>
            </div>
          </div>

          {pendingReceived.length > 0 && (
            <Button variant="sec" className="w-full" onClick={() => setPage?.('requests')}>
              Revisar aprovações ({pendingReceived.length})
            </Button>
          )}
        </div>
      </aside>

      {sel && (
        <Modal title={`Solicitar: ${sel.name}`} onClose={() => setSel(null)}>
          <form onSubmit={submit} noValidate>
            <Field
              label={`Quantidade (kg) — máx. ${sel.availableKg}`}
              type="number"
              min="0"
              step="0.1"
              value={qty}
              onChange={e => setQty(e.target.value)}
              error={err}
            />
            <div className="row mt-4">
              <Button type="submit" disabled={busy}>Enviar solicitação</Button>
              <Button variant="sec" onClick={() => setSel(null)}>Cancelar</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

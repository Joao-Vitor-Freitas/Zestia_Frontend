import { useId, useState } from 'react'
import { api } from '../services/api'
import { getAll } from '../services/data'
import { useApp } from '../context'
import { useAsync } from '../hooks/useAsync'
import { useBusy } from '../hooks/useBusy'
import { TYPES, VERIFICATION } from '../constants'
import AsyncView from '../components/AsyncView'
import PageHeader from '../components/PageHeader'
import Button from '../components/Button'
import Field from '../components/Field'
import Modal from '../components/Modal'
import Icon from '../components/Icon'
import { Avatar, OriginTag } from '../components/Badges'

// Transições aceitas pela API: [novo status, rótulo do botão, variante]
const ACTIONS = {
  PENDING: [['VERIFIED', 'Verificar', ''], ['REJECTED', 'Recusar', 'del']],
  VERIFIED: [['SUSPENDED', 'Suspender', 'del']],
  SUSPENDED: [['PENDING', 'Reabrir análise', 'sec']],
  REJECTED: [['PENDING', 'Reabrir análise', 'sec']],
}
const ORDER = { PENDING: 0, REJECTED: 1, SUSPENDED: 2, VERIFIED: 3 }
const BADGE = { PENDING: 'PENDING', VERIFIED: 'AVAILABLE', REJECTED: 'REJECTED', SUSPENDED: 'REJECTED' }
const FILTERS = [['PENDING', 'Pendentes'], ['all', 'Todas']]

export function VerificationStatus({ status }) {
  return <span className={`status status-${BADGE[status]}`}><Icon name={status === 'VERIFIED' ? 'check' : status === 'PENDING' ? 'clock' : 'alert'} size={14} />{VERIFICATION[status]}</span>
}

// Somente administradores (account.role === 'ADMIN'): analisa as comprovações das organizações.
export default function Verification() {
  const { orgId, notify, refreshOrgs } = useApp()
  const [busy, run] = useBusy()
  const [flt, setFlt] = useState('PENDING')
  const [sel, setSel] = useState(null) // { org, evidence, loading }
  const [decision, setDecision] = useState(null), [reason, setReason] = useState(''), [err, setErr] = useState('')
  const ids = useId()
  const { data, loading, error, reload } = useAsync(() => getAll('/organizations'), [])
  const all = (data || []).slice().sort((a, b) => ORDER[a.verificationStatus] - ORDER[b.verificationStatus] || a.name.localeCompare(b.name))
  const list = flt === 'all' ? all : all.filter(o => o.verificationStatus === flt)
  const pendingCount = all.filter(o => o.verificationStatus === 'PENDING').length

  const open = async o => {
    setSel({ org: o, evidence: null, loading: true }); setDecision(null); setReason(''); setErr('')
    try { const { evidence } = await api.get(`/organizations/${o.id}/verification`); setSel({ org: o, evidence, loading: false }) }
    catch (x) { setSel({ org: o, evidence: null, loading: false, error: x.message }) }
  }
  const decide = async e => {
    e.preventDefault()
    if (!reason.trim()) return setErr('Explique o motivo da decisão (fica registrado no histórico).')
    await run(async () => {
      try {
        await api.post(`/organizations/${sel.org.id}/verification/review`, { status: decision[0], reason: reason.trim() })
        notify(`${sel.org.name}: ${VERIFICATION[decision[0]].toLowerCase()}.`)
        setSel(null); reload(); refreshOrgs()
      } catch (x) { setErr(x.message) }
    })
  }

  return (
    <>
      <PageHeader title="Verificação de organizações"
        sub="Confira a comprovação antes de liberar doações e requisições. Só organizações verificadas participam das trocas."
        actions={<Button variant="sec" aria-label="Atualizar lista" onClick={reload}><Icon name="refresh" size={18} />Atualizar</Button>} />
      <div role="group" aria-label="Filtrar organizações" className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map(([k, l]) => <button key={k} type="button" className="chip" aria-pressed={flt === k} onClick={() => setFlt(k)}>{l}{k === 'PENDING' && data ? ` (${pendingCount})` : ''}</button>)}
      </div>
      <AsyncView data={data} loading={loading} error={error} onRetry={reload} empty={!list.length}
        emptyText={flt === 'PENDING' ? 'Nenhuma organização aguardando verificação.' : 'Nenhuma organização cadastrada.'}>
        <ul className="grid gap-3">
          {list.map(o => (
            <li key={o.id}>
              <article aria-labelledby={`${ids}${o.id}`} className="card flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <Avatar name={o.name} type={o.type} />
                  <div className="min-w-0">
                    <h2 id={`${ids}${o.id}`} className="text-lg leading-6">{o.name}{o.id === orgId && <span className="ml-2 text-xs font-semibold text-muted">(sua)</span>}</h2>
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
                      <OriginTag type={o.type} /><span className="sr-only">({TYPES[o.type]})</span>{o.location}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <VerificationStatus status={o.verificationStatus} />
                  <Button variant="sec" aria-label={`Analisar ${o.name}`} onClick={() => open(o)}>Analisar</Button>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </AsyncView>

      {sel && (
        <Modal title={sel.org.name} onClose={() => setSel(null)}>
          <dl className="mb-5 grid gap-3 rounded-xl bg-canvas p-4 text-sm">
            <div><dt className="text-muted">Tipo e localização</dt><dd className="font-semibold">{TYPES[sel.org.type]} · {sel.org.location}</dd></div>
            <div><dt className="text-muted">Situação</dt><dd className="mt-1"><VerificationStatus status={sel.org.verificationStatus} /></dd></div>
            <div>
              <dt className="text-muted">Comprovação enviada</dt>
              <dd className="mt-1 whitespace-pre-wrap">{sel.loading ? 'Carregando…' : sel.error || sel.evidence || <em className="text-muted">Nenhuma comprovação enviada ainda.</em>}</dd>
            </div>
          </dl>
          {sel.org.id === orgId ? (
            <p className="info"><Icon name="info" size={18} className="mt-0.5" />Administradores não podem analisar a própria organização.</p>
          ) : !decision ? (
            <div className="flex flex-wrap justify-end gap-2">
              {ACTIONS[sel.org.verificationStatus].map(([st, label, v]) => (
                <Button key={st} variant={v} disabled={st === 'VERIFIED' && !sel.evidence}
                  aria-describedby={st === 'VERIFIED' && !sel.evidence && !sel.loading ? `${ids}need` : undefined}
                  onClick={() => { setDecision([st, label]); setErr('') }}>{label}</Button>
              ))}
              {!sel.loading && !sel.evidence && sel.org.verificationStatus === 'PENDING' && <p id={`${ids}need`} className="hint w-full text-right">Para verificar, a organização precisa enviar a comprovação.</p>}
            </div>
          ) : (
            <form onSubmit={decide} noValidate className="grid gap-5">
              <Field as="textarea" rows={3} label={`Motivo: ${decision[1].toLowerCase()}`} required maxLength={1000}
                hint="Fica registrado no histórico da organização." value={reason} onChange={e => setReason(e.target.value)} error={err} />
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button variant="sec" onClick={() => setDecision(null)}>Voltar</Button>
                <Button type="submit" variant={decision[0] === 'VERIFIED' ? '' : decision[0] === 'PENDING' ? '' : 'del'} disabled={busy}>Confirmar: {decision[1].toLowerCase()}</Button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </>
  )
}

import { useState } from 'react'
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

export default function Offers() {
  const { org, orgId, notify } = useApp()
  const [busy, run] = useBusy()
  const [q, setQ] = useState(''), [cat, setCat] = useState('')
  const [sel, setSel] = useState(null), [qty, setQty] = useState(''), [err, setErr] = useState('')
  const { data, loading, error, reload } = useAsync(() => api.get('/foods'), [orgId])
  const avail = (data || []).filter(f => f.donorOrganizationId !== orgId && f.availableKg > 0 && new Date(f.expirationDate + 'T23:59:59') > new Date())
  const cats = [...new Set(avail.map(f => f.category))]
  const cur = cats.includes(cat) ? cat : ''
  const list = avail.filter(f => (!cur || f.category === cur) && f.name.toLowerCase().includes(q.toLowerCase()))
  const open = f => { setSel(f); setQty(''); setErr('') }
  const submit = async e => {
    e.preventDefault()
    const n = Number(qty)
    if (!(n > 0)) return setErr('Informe uma quantidade maior que zero.')
    if (n > sel.availableKg) return setErr(`Máximo disponível: ${sel.availableKg} kg.`)
    await run(async () => { try { await api.post('/requests', { foodId: sel.id, quantityKg: n }); notify('Solicitação enviada!'); setSel(null); reload() } catch (x) { setErr(x.message) } })
  }
  return (
    <>
      <section className="card mb-4">
        <small className="font-bold uppercase tracking-wider text-primary">Painel de resgate ativo{org?.location && ` · ${org.location}`}</small>
        <h1 className="mb-0">Ofertas disponíveis</h1>
        <p className="text-slate-600">{org?.name} ({TYPES[org?.type]})</p>
        <Field label="Buscar alimento" placeholder="Ex.: tomate" value={q} onChange={e => setQ(e.target.value)} />
        <div className="row" role="group" aria-label="Categorias">
          {['', ...cats].map(c => <button key={c} type="button" className="pill" aria-pressed={cur === c} onClick={() => setCat(c)}>{c || 'Todas'}</button>)}
          <Button variant="sec" aria-label="Atualizar lista" onClick={reload}>Atualizar</Button>
        </div>
      </section>
      <AsyncView data={data} loading={loading} error={error} onRetry={reload} empty={!list.length} emptyText="Nenhuma oferta disponível no momento.">
        <div className="grid">
          {list.map(f => <FoodCard key={f.id} food={f}><Button aria-label={`Solicitar doação de ${f.name}`} onClick={() => open(f)}>Solicitar doação</Button></FoodCard>)}
        </div>
      </AsyncView>
      {sel && (
        <Modal title={`Solicitar: ${sel.name}`} onClose={() => setSel(null)}>
          <form onSubmit={submit} noValidate>
            <Field label={`Quantidade (kg) — máx. ${sel.availableKg}`} type="number" min="0" step="0.1" value={qty} onChange={e => setQty(e.target.value)} error={err} />
            <div className="row"><Button type="submit" disabled={busy}>Enviar solicitação</Button><Button variant="sec" onClick={() => setSel(null)}>Cancelar</Button></div>
          </form>
        </Modal>
      )}
    </>
  )
}

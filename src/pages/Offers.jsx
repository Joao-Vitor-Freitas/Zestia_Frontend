import { useState } from 'react'
import { api } from '../services/api'
import { useApp } from '../context'
import { useAsync } from '../hooks/useAsync'
import AsyncView from '../components/AsyncView'
import FoodCard from '../components/FoodCard'
import Field from '../components/Field'
import Button from '../components/Button'
import Modal from '../components/Modal'

export default function Offers() {
  const { orgId, notify } = useApp()
  const [q, setQ] = useState(''), [cat, setCat] = useState('')
  const [sel, setSel] = useState(null), [qty, setQty] = useState(''), [err, setErr] = useState('')
  const { data, loading, error, reload } = useAsync(() => api.get('/foods'), [orgId])
  const list = (data || []).filter(f => f.donorOrganizationId !== orgId && f.availableKg > 0 && new Date(f.expirationDate + 'T23:59:59') > new Date()
    && (!cat || f.category === cat) && f.name.toLowerCase().includes(q.toLowerCase()))
  const cats = [...new Set((data || []).map(f => f.category))]
  const open = f => { setSel(f); setQty(''); setErr('') }
  const submit = async e => {
    e.preventDefault()
    const n = Number(qty)
    if (!(n > 0)) return setErr('Informe uma quantidade maior que zero.')
    if (n > sel.availableKg) return setErr(`Máximo disponível: ${sel.availableKg} kg.`)
    try { await api.post('/requests', { foodId: sel.id, quantityKg: n }); notify('Solicitação enviada!'); setSel(null); reload() } catch (x) { setErr(x.message) }
  }
  return (
    <>
      <h1>Ofertas disponíveis</h1>
      <div className="row">
        <Field label="Buscar" placeholder="Ex.: tomate" value={q} onChange={e => setQ(e.target.value)} />
        <Field as="select" label="Categoria" value={cat} onChange={e => setCat(e.target.value)}>
          <option value="">Todas</option>{cats.map(c => <option key={c}>{c}</option>)}
        </Field>
      </div>
      <AsyncView loading={loading} error={error} onRetry={reload} empty={!list.length} emptyText="Nenhuma oferta disponível no momento.">
        <div className="grid">
          {list.map(f => <FoodCard key={f.id} food={f}><Button onClick={() => open(f)}>Solicitar doação</Button></FoodCard>)}
        </div>
      </AsyncView>
      {sel && (
        <Modal title={`Solicitar: ${sel.name}`} onClose={() => setSel(null)}>
          <form onSubmit={submit} noValidate>
            <Field label={`Quantidade (kg) — máx. ${sel.availableKg}`} type="number" min="0" step="0.1" value={qty} onChange={e => setQty(e.target.value)} error={err} />
            <div className="row"><Button type="submit">Enviar solicitação</Button><Button variant="sec" onClick={() => setSel(null)}>Cancelar</Button></div>
          </form>
        </Modal>
      )}
    </>
  )
}

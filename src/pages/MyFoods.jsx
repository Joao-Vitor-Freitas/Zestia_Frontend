import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { useApp } from '../context'
import { useAsync } from '../hooks/useAsync'
import { useBusy } from '../hooks/useBusy'
import { CATEGORIES } from '../constants'
import AsyncView from '../components/AsyncView'
import FoodCard from '../components/FoodCard'
import Field from '../components/Field'
import Button from '../components/Button'
import Modal from '../components/Modal'
import { expiry } from '../components/ExpiryGauge'

export default function MyFoods({ openCreate, onConsumeCreate }) {
  const { orgId, org, notify } = useApp()
  const [busy, run] = useBusy()
  const { data, loading, error, reload } = useAsync(() => api.get('/foods'), [orgId])
  const [form, setForm] = useState(null)
  const [err, setErr] = useState({})

  useEffect(() => {
    if (openCreate) {
      setErr({})
      setForm({ name: '', category: '', quantityKg: '', expirationDate: '' })
      onConsumeCreate?.()
    }
  }, [openCreate])

  const mine = (data || []).filter(f => f.donorOrganizationId === orgId)
  const cats = [...new Set([...CATEGORIES, ...(data || []).map(f => f.category)])]
  const set = k => e => setForm({ ...form, [k]: e.target.value })

  const save = async e => {
    e.preventDefault()
    const v = {}
    if (!form.name?.trim()) v.name = 'Informe o nome.'
    if (!form.category?.trim()) v.category = 'Informe a categoria.'
    if (!(Number(form.quantityKg) > 0)) v.quantityKg = 'Quantidade deve ser maior que zero.'
    if (!form.expirationDate) v.expirationDate = 'Informe a validade.'
    else if (form.expirationDate < new Date().toLocaleDateString('sv')) {
      v.expirationDate = 'A validade não pode estar no passado.'
    }
    setErr(v)
    if (Object.keys(v).length) return

    const body = { ...form, quantityKg: Number(form.quantityKg) }
    await run(async () => {
      try {
        form.id ? await api.put(`/foods/${form.id}`, body) : await api.post('/foods', body)
        notify('Alimento salvo.')
        setForm(null)
        reload()
      } catch (x) {
        notify(x.message, 'error')
      }
    })
  }

  const remove = async f => {
    if (!confirm(`Excluir ${f.name}?`)) return
    await run(async () => {
      try {
        await api.del(`/foods/${f.id}`)
        notify('Alimento excluído.')
        reload()
      } catch (x) {
        notify(x.message, 'error')
      }
    })
  }

  const previewExpiry = form?.expirationDate ? expiry(form.expirationDate) : null

  return (
    <>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="mb-1">Meus alimentos</h1>
          <p className="text-sm text-muted">Gerencie os lotes publicados pela sua organização</p>
        </div>
        <Button onClick={() => { setErr({}); setForm({ name: '', category: '', quantityKg: '', expirationDate: '' }) }}>
          Cadastrar doação
        </Button>
      </div>

      <AsyncView
        data={data}
        loading={loading}
        error={error}
        onRetry={reload}
        empty={!mine.length}
        emptyText="Você ainda não cadastrou alimentos."
      >
        <div className="grid">
          {mine.map(f => (
            <FoodCard key={f.id} food={f}>
              <Button
                variant="sec"
                aria-label={`Editar ${f.name}`}
                onClick={() => {
                  setErr({})
                  setForm({
                    id: f.id,
                    name: f.name,
                    category: f.category,
                    quantityKg: f.quantityKg,
                    expirationDate: f.expirationDate,
                  })
                }}
              >
                Editar
              </Button>
              <Button
                variant="del"
                disabled={f.hasRequests}
                title={f.hasRequests ? 'Alimento com solicitações não pode ser excluído' : undefined}
                aria-label={`Excluir ${f.name}`}
                onClick={() => remove(f)}
              >
                Excluir
              </Button>
            </FoodCard>
          ))}
        </div>
      </AsyncView>

      {form && (
        <Modal title={form.id ? 'Editar alimento' : 'Cadastrar doação'} onClose={() => setForm(null)}>
          <form onSubmit={save} noValidate>
            <Field label="Nome" placeholder="Ex.: Hortifrúti variado" value={form.name} onChange={set('name')} error={err.name} />
            <Field label="Categoria" list="categorias" placeholder="Ex.: Hortifrúti" value={form.category} onChange={set('category')} error={err.category} />
            <datalist id="categorias">{cats.map(c => <option key={c} value={c} />)}</datalist>
            <Field label="Quantidade (kg)" type="number" min="0" step="0.1" value={form.quantityKg} onChange={set('quantityKg')} error={err.quantityKg} />
            <Field label="Validade" type="date" value={form.expirationDate} onChange={set('expirationDate')} error={err.expirationDate} />

            {(form.name || previewExpiry) && (
              <div className="mb-4 rounded-xl border border-line bg-canvas p-3">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-muted">Prévia no feed</span>
                <div className="mt-1.5 flex items-center justify-between gap-2">
                  <strong className="truncate text-sm text-ink">{form.name || 'Novo lote'}</strong>
                  {previewExpiry && (
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${previewExpiry.pillStyle}`}>
                      {previewExpiry.chip}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted">
                  {org?.name} {form.quantityKg ? `· ≈ ${form.quantityKg} kg` : ''}
                </p>
              </div>
            )}

            <div className="row">
              <Button type="submit" disabled={busy}>Salvar</Button>
              <Button variant="sec" onClick={() => setForm(null)}>Cancelar</Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}

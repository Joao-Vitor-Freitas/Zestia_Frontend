import { useState } from 'react'
import { api } from '../services/api'
import { useApp } from '../context'
import { useAsync } from '../hooks/useAsync'
import AsyncView from '../components/AsyncView'
import FoodCard from '../components/FoodCard'
import Field from '../components/Field'
import Button from '../components/Button'
import Modal from '../components/Modal'

export default function MyFoods() {
  const { orgId, notify } = useApp()
  const { data, loading, error, reload } = useAsync(() => api.get('/foods'), [orgId])
  const [form, setForm] = useState(null), [err, setErr] = useState({})
  const mine = (data || []).filter(f => f.donorOrganizationId === orgId)
  const set = k => e => setForm({ ...form, [k]: e.target.value })
  const save = async e => {
    e.preventDefault()
    const v = {}
    if (!form.name?.trim()) v.name = 'Informe o nome.'
    if (!form.category?.trim()) v.category = 'Informe a categoria.'
    if (!(Number(form.quantityKg) > 0)) v.quantityKg = 'Quantidade deve ser maior que zero.'
    if (!form.expirationDate) v.expirationDate = 'Informe a validade.'
    setErr(v); if (Object.keys(v).length) return
    try {
      form.id ? await api.put(`/foods/${form.id}`, form) : await api.post('/foods', form)
      notify('Alimento salvo.'); setForm(null); reload()
    } catch (x) { notify(x.message, 'error') }
  }
  const remove = async f => {
    if (!confirm(`Excluir ${f.name}?`)) return
    try { await api.del(`/foods/${f.id}`); notify('Alimento excluído.'); reload() } catch (x) { notify(x.message, 'error') }
  }
  return (
    <>
      <h1>Meus alimentos</h1>
      <Button onClick={() => { setErr({}); setForm({ name: '', category: '', quantityKg: '', expirationDate: '' }) }}>Cadastrar doação</Button>
      <AsyncView loading={loading} error={error} onRetry={reload} empty={!mine.length} emptyText="Você ainda não cadastrou alimentos.">
        <div className="grid" style={{ marginTop: 16 }}>
          {mine.map(f => (
            <FoodCard key={f.id} food={f}>
              <Button variant="sec" onClick={() => { setErr({}); setForm(f) }}>Editar</Button>
              <Button variant="del" onClick={() => remove(f)}>Excluir</Button>
            </FoodCard>
          ))}
        </div>
      </AsyncView>
      {form && (
        <Modal title={form.id ? 'Editar alimento' : 'Cadastrar doação'} onClose={() => setForm(null)}>
          <form onSubmit={save} noValidate>
            <Field label="Nome" value={form.name} onChange={set('name')} error={err.name} />
            <Field label="Categoria" value={form.category} onChange={set('category')} error={err.category} />
            <Field label="Quantidade (kg)" type="number" min="0" step="0.1" value={form.quantityKg} onChange={set('quantityKg')} error={err.quantityKg} />
            <Field label="Validade" type="date" value={form.expirationDate} onChange={set('expirationDate')} error={err.expirationDate} />
            <div className="row"><Button type="submit">Salvar</Button><Button variant="sec" onClick={() => setForm(null)}>Cancelar</Button></div>
          </form>
        </Modal>
      )}
    </>
  )
}

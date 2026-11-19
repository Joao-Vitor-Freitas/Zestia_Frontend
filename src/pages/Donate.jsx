import { useId, useRef, useState } from 'react'
import { api } from '../services/api'
import { useApp } from '../context'
import { useBusy } from '../hooks/useBusy'
import { CATEGORIES } from '../constants'
import PageHeader from '../components/PageHeader'
import FoodCard from '../components/FoodCard'
import Field, { focusFirstInvalid } from '../components/Field'
import Button from '../components/Button'
import Icon from '../components/Icon'
import { ExpirySeal } from '../components/Badges'

const EMPTY = { name: '', category: '', quantityKg: '', expirationDate: '' }
const isDate = d => /^\d{4}-\d{2}-\d{2}$/.test(d)

// Nova doação / edição de lote. param = lote a editar (opcional).
export default function Donate({ go, param }) {
  const { org, notify } = useApp()
  const [busy, run] = useBusy()
  const editing = !!param
  const [form, setForm] = useState(() => editing
    ? { id: param.id, name: param.name, category: param.category, quantityKg: String(param.quantityKg), expirationDate: param.expirationDate }
    : EMPTY)
  const [err, setErr] = useState({})
  const ref = useRef(), pid = useId()
  const today = new Date().toLocaleDateString('sv')
  const set = k => e => setForm({ ...form, [k]: e.target.value })
  const cats = form.category && !CATEGORIES.includes(form.category) ? [...CATEGORIES, form.category] : CATEGORIES

  const save = async e => {
    e.preventDefault()
    const v = {}
    if (!form.name?.trim()) v.name = 'Informe o que está doando.'
    if (!form.category?.trim()) v.category = 'Escolha a categoria.'
    if (!(Number(form.quantityKg) > 0)) v.quantityKg = 'Quantidade deve ser maior que zero.'
    if (!form.expirationDate) v.expirationDate = 'Informe a validade.'
    else if (!editing && form.expirationDate < today) v.expirationDate = 'A validade não pode estar no passado.'
    setErr(v)
    if (Object.keys(v).length) return focusFirstInvalid(ref.current)
    const body = { name: form.name.trim(), category: form.category, quantityKg: Number(form.quantityKg), expirationDate: form.expirationDate }
    await run(async () => {
      try {
        editing ? await api.put(`/foods/${form.id}`, body) : await api.post('/foods', body)
        notify(editing ? 'Lote atualizado.' : 'Doação publicada.'); go('foods')
      } catch (x) { notify(x.message, 'error') }
    })
  }

  const qty = Number(form.quantityKg) > 0 ? Number(form.quantityKg) : 0
  const preview = { name: form.name.trim() || 'Nome do lote', category: form.category, donorName: org?.name, availableKg: qty, quantityKg: qty, expirationDate: isDate(form.expirationDate) ? form.expirationDate : '' }

  return (
    <>
      <PageHeader title={editing ? 'Editar lote' : 'Nova doação'}
        sub={editing ? 'Ajuste os dados do lote. A quantidade não pode ficar abaixo do que já foi aprovado.' : 'Leva cerca de 1 minuto. As organizações da rede veem o lote assim que ele é publicado.'} />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <form ref={ref} onSubmit={save} noValidate aria-label="Dados da doação" className="card grid gap-5 md:p-6">
          <Field label="O que está doando?" placeholder="Ex.: Hortifrúti variado" autoComplete="off" required value={form.name} onChange={set('name')} error={err.name} />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field as="select" label="Categoria" required value={form.category} onChange={set('category')} error={err.category}>
              <option value="">Selecione</option>{cats.map(c => <option key={c} value={c}>{c}</option>)}
            </Field>
            <Field label="Quantidade (kg)" type="number" inputMode="decimal" min="0" step="0.1" required placeholder="Ex.: 25" value={form.quantityKg} onChange={set('quantityKg')} error={err.quantityKg} />
          </div>
          <div className="grid gap-2">
            <Field label="Validade" type="date" min={editing ? undefined : today} required value={form.expirationDate} onChange={set('expirationDate')} error={err.expirationDate}
              hint="O selo de urgência é calculado automaticamente." />
            <div aria-live="polite">{preview.expirationDate && <ExpirySeal date={preview.expirationDate} />}</div>
          </div>
          <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
            <Button variant="sec" onClick={() => go('foods')}>Cancelar</Button>
            <Button type="submit" disabled={busy}>{editing ? 'Salvar alterações' : 'Publicar doação'}</Button>
          </div>
        </form>

        <aside aria-labelledby={pid} className="grid gap-3 lg:sticky lg:top-6">
          <h2 id={pid} className="eyebrow">Prévia no feed</h2>
          {/* duplicata visual do formulário: oculta para leitores de tela */}
          <div aria-hidden="true"><FoodCard food={preview} type={org?.type} as="p" /></div>
          <p className="info"><Icon name="bell" size={18} className="mt-0.5" />Ao publicar, as organizações da rede veem o lote em “Explorar doações”, com os que vencem antes no topo.</p>
        </aside>
      </div>
    </>
  )
}

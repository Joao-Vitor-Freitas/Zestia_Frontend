import { useState } from 'react'
import { api } from '../services/api'
import { useApp } from '../context'
import { useAsync } from '../hooks/useAsync'
import { TYPES } from '../constants'
import AsyncView from '../components/AsyncView'
import Button from '../components/Button'
import Field from '../components/Field'
import Modal from '../components/Modal'

export default function Organizations() {
  const { notify, refreshOrgs } = useApp()
  const { data, loading, error, reload } = useAsync(() => api.get('/organizations'), [])
  const [form, setForm] = useState(null), [err, setErr] = useState({})
  const set = k => e => setForm({ ...form, [k]: e.target.value })
  const done = m => { notify(m); setForm(null); reload(); refreshOrgs() }
  const save = async e => {
    e.preventDefault()
    const v = {}
    if (!form.name?.trim()) v.name = 'Informe o nome.'
    if (!form.type) v.type = 'Escolha o tipo.'
    setErr(v); if (Object.keys(v).length) return
    try { form.id ? await api.put(`/organizations/${form.id}`, form) : await api.post('/organizations', form); done('Organização salva.') } catch (x) { notify(x.message, 'error') }
  }
  const remove = async o => {
    if (!confirm(`Excluir ${o.name}?`)) return
    try { await api.del(`/organizations/${o.id}`); done('Organização excluída.') } catch (x) { notify(x.message, 'error') }
  }
  return (
    <>
      <h1>Organizações</h1>
      <Button onClick={() => { setErr({}); setForm({ name: '', type: '', location: '' }) }}>Nova organização</Button>
      <AsyncView loading={loading} error={error} onRetry={reload} empty={!data?.length} emptyText="Nenhuma organização cadastrada.">
        <div className="scroll" style={{ marginTop: 16 }}>
          <table>
            <thead><tr><th>Nome</th><th>Tipo</th><th>Localização</th><th>Ações</th></tr></thead>
            <tbody>
              {data?.map(o => (
                <tr key={o.id}><td>{o.name}</td><td>{TYPES[o.type]}</td><td>{o.location}</td>
                  <td><div className="row"><Button variant="sec" onClick={() => { setErr({}); setForm(o) }}>Editar</Button><Button variant="del" onClick={() => remove(o)}>Excluir</Button></div></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </AsyncView>
      {form && (
        <Modal title={form.id ? 'Editar organização' : 'Nova organização'} onClose={() => setForm(null)}>
          <form onSubmit={save} noValidate>
            <Field label="Nome" value={form.name} onChange={set('name')} error={err.name} />
            <Field as="select" label="Tipo" value={form.type} onChange={set('type')} error={err.type}>
              <option value="">Selecione</option>{Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Field>
            <Field label="Localização" value={form.location} onChange={set('location')} />
            <div className="row"><Button type="submit">Salvar</Button><Button variant="sec" onClick={() => setForm(null)}>Cancelar</Button></div>
          </form>
        </Modal>
      )}
    </>
  )
}

import { useState } from 'react'
import { api } from '../services/api'
import { useApp } from '../context'
import { useAsync } from '../hooks/useAsync'
import { useBusy } from '../hooks/useBusy'
import { TYPES } from '../constants'
import AsyncView from '../components/AsyncView'
import Button from '../components/Button'
import Field from '../components/Field'
import Modal from '../components/Modal'

export default function Organizations() {
  const { notify, refreshOrgs } = useApp()
  const [busy, run] = useBusy()
  const { data, loading, error, reload } = useAsync(() => api.get('/organizations'), [])
  const [form, setForm] = useState(null)
  const [err, setErr] = useState({})

  const set = k => e => setForm({ ...form, [k]: e.target.value })
  const done = m => {
    notify(m)
    setForm(null)
    reload()
    refreshOrgs()
  }

  const save = async e => {
    e.preventDefault()
    const v = {}
    if (!form.name?.trim()) v.name = 'Informe o nome.'
    if (!form.type) v.type = 'Escolha o tipo.'
    setErr(v)
    if (Object.keys(v).length) return

    await run(async () => {
      try {
        form.id ? await api.put(`/organizations/${form.id}`, form) : await api.post('/organizations', form)
        done('Organização salva.')
      } catch (x) {
        notify(x.message, 'error')
      }
    })
  }

  const remove = async o => {
    if (!confirm(`Excluir ${o.name}?`)) return
    await run(async () => {
      try {
        await api.del(`/organizations/${o.id}`)
        done('Organização excluída.')
      } catch (x) {
        notify(x.message, 'error')
      }
    })
  }

  return (
    <>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="mb-1">Organizações</h1>
          <p className="text-sm text-muted">Mercados, ONGs e cozinhas comunitárias participantes da rede</p>
        </div>
        <Button onClick={() => { setErr({}); setForm({ name: '', type: '', location: '' }) }}>
          Nova organização
        </Button>
      </div>

      <AsyncView
        data={data}
        loading={loading}
        error={error}
        onRetry={reload}
        empty={!data?.length}
        emptyText="Nenhuma organização cadastrada."
      >
        <div className="scroll shadow-card">
          <table>
            <caption className="sr-only">Organizações cadastradas</caption>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Tipo</th>
                <th>Localização</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {data?.map(o => (
                <tr key={o.id} className="hover:bg-canvas/40">
                  <td className="font-semibold text-ink">{o.name}</td>
                  <td>
                    <span className="inline-flex items-center rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-primary-dark">
                      {TYPES[o.type]}
                    </span>
                  </td>
                  <td className="text-muted">{o.location || '—'}</td>
                  <td>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button variant="sec" aria-label={`Editar ${o.name}`} onClick={() => { setErr({}); setForm(o) }}>
                        Editar
                      </Button>
                      <Button variant="del" aria-label={`Excluir ${o.name}`} onClick={() => remove(o)}>
                        Excluir
                      </Button>
                    </div>
                  </td>
                </tr>
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
              <option value="">Selecione</option>
              {Object.entries(TYPES).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </Field>
            <Field label="Localização" value={form.location} onChange={set('location')} />
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

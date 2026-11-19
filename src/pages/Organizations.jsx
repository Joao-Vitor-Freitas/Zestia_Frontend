import { useRef, useState } from 'react'
import { api } from '../services/api'
import { useApp } from '../context'
import { useAsync } from '../hooks/useAsync'
import { useBusy } from '../hooks/useBusy'
import { TYPES } from '../constants'
import AsyncView from '../components/AsyncView'
import PageHeader from '../components/PageHeader'
import Button from '../components/Button'
import Field, { focusFirstInvalid } from '../components/Field'
import Modal from '../components/Modal'
import Icon from '../components/Icon'
import { Avatar, OriginTag } from '../components/Badges'

export default function Organizations() {
  const { notify, refreshOrg, orgId } = useApp()
  const [busy, run] = useBusy()
  const { data, loading, error, reload } = useAsync(() => api.get('/organizations'), [])
  const [form, setForm] = useState(null), [err, setErr] = useState({})
  const ref = useRef()
  const set = k => e => setForm({ ...form, [k]: e.target.value })
  // Excluir a própria organização leva de volta à tela de cadastro (refreshOrg recebe 404).
  const done = m => { notify(m); setForm(null); reload(); refreshOrg() }
  const save = async e => {
    e.preventDefault()
    const v = {}
    if (!form.name?.trim()) v.name = 'Informe o nome.'
    if (!form.type) v.type = 'Escolha o tipo.'
    if (!form.location?.trim()) v.location = 'Informe a localização.'
    setErr(v)
    if (Object.keys(v).length) return focusFirstInvalid(ref.current)
    const { name, type, location } = form // a API recusa campos extras (id, verificationStatus...)
    await run(async () => { try { await api.put(`/organizations/${form.id}`, { name, type, location }); done('Organização salva.') } catch (x) { notify(x.message, 'error') } })
  }
  const remove = async o => {
    if (!confirm(`Excluir ${o.name}? Você precisará cadastrar uma nova organização para continuar.`)) return
    await run(async () => { try { await api.del(`/organizations/${o.id}`); done('Organização excluída.') } catch (x) { notify(x.message, 'error') } })
  }
  return (
    <>
      <PageHeader title="Organizações" sub="Mercados, ONGs e cozinhas da rede. Todas podem doar e receber." />
      <AsyncView data={data} loading={loading} error={error} onRetry={reload} empty={!data?.length} emptyText="Nenhuma organização cadastrada.">
        {/* região rolável focável: permite rolar a tabela pelo teclado em telas estreitas */}
        <div className="card overflow-x-auto p-0" role="region" aria-label="Organizações cadastradas" tabIndex={0}>
          <table className="min-w-[640px]">
            <caption className="sr-only">Organizações cadastradas</caption>
            <thead><tr><th scope="col">Nome</th><th scope="col">Tipo</th><th scope="col">Localização</th><th scope="col"><span className="sr-only">Ações</span></th></tr></thead>
            <tbody>
              {data?.map(o => (
                <tr key={o.id}>
                  <th scope="row" className="text-base font-semibold normal-case tracking-normal text-ink">
                    <span className="flex items-center gap-3"><Avatar name={o.name} type={o.type} className="h-10 w-10 text-sm" /><span>{o.name}{o.id === orgId && <span className="ml-2 text-xs font-semibold text-muted">(sua)</span>}</span></span>
                  </th>
                  <td><OriginTag type={o.type} /><span className="sr-only"> ({TYPES[o.type]})</span></td>
                  <td className="text-muted">{o.location || '—'}</td>
                  <td>
                    {o.id === orgId && (
                      <div className="flex justify-end gap-2">
                        <Button variant="sec" aria-label={`Editar ${o.name}`} onClick={() => { setErr({}); setForm(o) }}>Editar</Button>
                        <Button variant="del" disabled={busy} aria-label={`Excluir ${o.name}`} onClick={() => remove(o)}>Excluir</Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AsyncView>
      {form && (
        <Modal title="Editar organização" onClose={() => setForm(null)}>
          <form ref={ref} onSubmit={save} noValidate className="grid gap-5">
            <Field label="Nome" autoComplete="organization" required value={form.name} onChange={set('name')} error={err.name} />
            <Field as="select" label="Tipo" required value={form.type} onChange={set('type')} error={err.type}>
              <option value="">Selecione</option>{Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Field>
            <Field label="Localização" placeholder="Bairro ou cidade" required value={form.location || ''} onChange={set('location')} error={err.location} />
            {form.verificationStatus === 'VERIFIED' && <p className="hint">Mudar o nome ou o tipo faz a organização passar por uma nova verificação.</p>}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button variant="sec" onClick={() => setForm(null)}>Cancelar</Button>
              <Button type="submit" disabled={busy}>Salvar</Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}

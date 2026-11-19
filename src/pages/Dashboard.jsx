import { useId, useState } from 'react'
import { api } from '../services/api'
import { useApp } from '../context'
import { useAsync } from '../hooks/useAsync'
import { STATUS } from '../constants'
import AsyncView from '../components/AsyncView'
import PageHeader from '../components/PageHeader'
import Field from '../components/Field'
import Button from '../components/Button'
import Icon from '../components/Icon'

const num = v => Number(v || 0).toLocaleString('pt-BR', { maximumFractionDigits: 3 })

export default function Dashboard() {
  const { orgs } = useApp()
  const [o, setO] = useState(''), [s, setS] = useState('')
  const ids = useId()
  const { data, loading, error, reload } = useAsync(() => api.get(`/metrics?organizationId=${o}&status=${s}`), [o, s])
  const groups = data && [
    ['Alimentos', [['Alimento registrado (kg)', data.registeredKg], ['Alimento solicitado (kg)', data.requestedKg], ['Alimento aprovado (kg)', data.approvedKg]]],
    ['Requisições', [['Requisições pendentes', data.pending], ['Requisições aprovadas', data.approved], ['Requisições recusadas', data.rejected]]],
    ['Rede', [['Organizações', data.organizations]]],
  ]
  return (
    <>
      <PageHeader title="Painel de indicadores" sub="Números calculados a partir dos registros da rede."
        actions={<Button variant="sec" aria-label="Atualizar indicadores" onClick={reload}><Icon name="refresh" size={18} />Atualizar</Button>} />
      <div role="group" aria-label="Filtros do painel" className="card mb-8 grid gap-4 sm:grid-cols-2">
        <Field as="select" label="Organização" value={o} onChange={e => setO(e.target.value)}>
          <option value="">Todas</option>{orgs.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
        </Field>
        <Field as="select" label="Status da requisição" value={s} onChange={e => setS(e.target.value)}>
          <option value="">Todos</option>{Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </Field>
      </div>
      <AsyncView data={data} loading={loading} error={error} onRetry={reload}>
        <div className="grid gap-8">
          {groups?.map(([title, items], i) => (
            <section key={title} aria-labelledby={`${ids}${i}`}>
              <h2 id={`${ids}${i}`} className="eyebrow mb-3 font-sans">{title}</h2>
              <dl className="grid-cards">
                {items.map(([l, v]) => (
                  <div key={l} className="card">
                    <dt className="text-sm text-muted">{l}</dt>
                    <dd className="mt-1 font-display text-[32px] font-bold leading-10 text-primary">{num(v)}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
          <p className="hint">“Aprovado” não significa entregue ou consumido.</p>
        </div>
      </AsyncView>
    </>
  )
}

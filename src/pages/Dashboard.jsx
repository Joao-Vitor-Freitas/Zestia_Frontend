import { useState } from 'react'
import { api } from '../services/api'
import { useApp } from '../context'
import { useAsync } from '../hooks/useAsync'
import { STATUS } from '../constants'
import AsyncView from '../components/AsyncView'
import MetricCard from '../components/MetricCard'
import Field from '../components/Field'

export default function Dashboard() {
  const { orgs } = useApp()
  const [o, setO] = useState(''), [s, setS] = useState('')
  const { data, loading, error, reload } = useAsync(() => api.get(`/metrics?organizationId=${o}&status=${s}`), [o, s])
  const m = data && [
    ['Organizações', data.organizations], ['Alimento registrado (kg)', data.registeredKg], ['Alimento solicitado (kg)', data.requestedKg],
    ['Alimento aprovado (kg)', data.approvedKg], ['Solicitações pendentes', data.pending], ['Solicitações aprovadas', data.approved], ['Solicitações rejeitadas', data.rejected],
  ]
  return (
    <>
      <h1>Painel de indicadores</h1>
      <div className="row">
        <Field as="select" label="Organização" value={o} onChange={e => setO(e.target.value)}>
          <option value="">Todas</option>{orgs.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
        </Field>
        <Field as="select" label="Status da solicitação" value={s} onChange={e => setS(e.target.value)}>
          <option value="">Todos</option>{Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </Field>
      </div>
      <AsyncView loading={loading} error={error} onRetry={reload}>
        <div className="grid">{m?.map(([l, v]) => <MetricCard key={l} label={l} value={v} />)}</div>
        <p>Valores calculados a partir dos registros. “Aprovado” não significa entregue ou consumido.</p>
      </AsyncView>
    </>
  )
}

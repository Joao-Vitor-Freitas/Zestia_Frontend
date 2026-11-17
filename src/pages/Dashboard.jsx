import { useState } from 'react'
import { api } from '../services/api'
import { useApp } from '../context'
import { useAsync } from '../hooks/useAsync'
import { STATUS } from '../constants'
import AsyncView from '../components/AsyncView'
import MetricCard from '../components/MetricCard'
import Field from '../components/Field'
import Button from '../components/Button'

export default function Dashboard() {
  const { orgs } = useApp()
  const [o, setO] = useState('')
  const [s, setS] = useState('')
  const { data, loading, error, reload } = useAsync(() => api.get(`/metrics?organizationId=${o}&status=${s}`), [o, s])

  const m = data && [
    ['Organizações', data.organizations],
    ['Alimento registrado (kg)', data.registeredKg],
    ['Alimento solicitado (kg)', data.requestedKg],
    ['Alimento aprovado (kg)', data.approvedKg],
    ['Solicitações pendentes', data.pending],
    ['Solicitações aprovadas', data.approved],
    ['Solicitações rejeitadas', data.rejected],
  ]

  return (
    <>
      <div className="mb-6">
        <h1 className="mb-1">Painel de indicadores</h1>
        <p className="text-sm text-muted">Acompanhe o impacto e o volume redistribuído na rede</p>
      </div>

      <div className="card mb-6 flex flex-wrap items-end gap-4">
        <div className="min-w-[200px] flex-1">
          <Field as="select" label="Organização" value={o} onChange={e => setO(e.target.value)}>
            <option value="">Todas</option>
            {orgs.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
          </Field>
        </div>
        <div className="min-w-[200px] flex-1">
          <Field as="select" label="Status da solicitação" value={s} onChange={e => setS(e.target.value)}>
            <option value="">Todos</option>
            {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Field>
        </div>
        <div className="mb-3.5">
          <Button variant="sec" aria-label="Atualizar indicadores" onClick={reload}>Atualizar</Button>
        </div>
      </div>

      <AsyncView data={data} loading={loading} error={error} onRetry={reload}>
        <div className="grid">
          {m?.map(([l, v]) => <MetricCard key={l} label={l} value={v} />)}
        </div>
        <p className="mt-4 text-xs text-muted">
          Valores calculados a partir dos registros. “Aprovado” não significa entregue ou consumido.
        </p>
      </AsyncView>
    </>
  )
}

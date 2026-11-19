import { useApp } from '../context'
import { api } from '../services/api'
import { useAsync } from '../hooks/useAsync'
import { TYPES } from '../constants'
import Icon from './Icon'
import { Avatar } from './Badges'

// Desktop: barra lateral fixa. Celular: topo (marca, gestão, organização) + navegação principal fixa embaixo.
// Um único DOM para os dois tamanhos: sem controles duplicados para leitores de tela.
export default function Sidebar({ pages, route, go }) {
  const { orgs, orgId, org, choose, msg } = useApp()
  // contador de aprovações pendentes: recarrega ao trocar de tela/organização e após cada ação (msg)
  const { data } = useAsync(() => (orgId ? api.get('/requests') : Promise.resolve([])), [orgId, route, msg])
  const pending = (data || []).filter(r => r.donorOrganizationId === orgId && r.status === 'PENDING').length

  const item = ([k, p]) => {
    const current = route.page === k && !(k === 'new' && route.param)
    return (
      <li key={k} className={p.cta ? 'nav-cta-li' : undefined}>
        <button type="button" className={p.cta ? 'nav-cta' : 'nav-item'} aria-current={current ? 'page' : undefined} onClick={() => go(k)}>
          <span className={p.cta ? undefined : 'nav-ico'}><Icon name={p.icon} size={p.cta ? 24 : 20} /></span>
          <span className={p.cta ? 'max-md:sr-only' : undefined}>{p.label}</span>
          {k === 'approvals' && pending > 0 && (
            <span className="nav-count"><span aria-hidden="true">{pending}</span><span className="sr-only">, {pending} {pending === 1 ? 'pendente' : 'pendentes'}</span></span>
          )}
        </button>
      </li>
    )
  }
  const entries = Object.entries(pages)

  return (
    <header className="shell">
      <p className="brand"><span className="logo"><Icon name="leaf" /></span>zestia</p>
      <nav aria-label="Principal" className="nav-main"><ul>{entries.filter(([, p]) => !p.sec).map(item)}</ul></nav>
      <nav aria-labelledby="nav-sec-t" className="nav-sec">
        <p id="nav-sec-t" className="nav-sec-title eyebrow">Gestão</p>
        <ul>{entries.filter(([, p]) => p.sec).map(item)}</ul>
      </nav>
      {orgs.length > 0 && (
        <div className="org-card">
          <div className="mb-3 hidden items-center gap-3 md:flex">
            <Avatar name={org?.name} type={org?.type} className="h-10 w-10 text-sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{org?.name}</p>
              <p className="text-xs text-muted">{TYPES[org?.type]}</p>
            </div>
          </div>
          <label htmlFor="org-switch" className="block text-xs font-semibold text-muted">Atuando como</label>
          <select id="org-switch" className="mt-1 min-h-11 text-sm" value={orgId} onChange={e => choose(e.target.value)}>
            {orgs.map(o => <option key={o.id} value={o.id}>{o.name} ({TYPES[o.type]})</option>)}
          </select>
        </div>
      )}
    </header>
  )
}

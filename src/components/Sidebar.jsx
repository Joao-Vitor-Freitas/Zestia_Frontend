import { useApp } from '../context'
import { getAll } from '../services/data'
import { useAsync } from '../hooks/useAsync'
import { TYPES, VERIFICATION } from '../constants'
import Icon from './Icon'
import { Avatar } from './Badges'

// Desktop: barra lateral fixa. Celular: topo (marca, gestão, organização) + navegação principal fixa embaixo.
// Um único DOM para os dois tamanhos: sem controles duplicados para leitores de tela.
export default function Sidebar({ pages, route, go }) {
  const { account, orgId, org, logout, msg } = useApp()
  const verified = org?.verificationStatus === 'VERIFIED'
  // contador de aprovações pendentes: recarrega ao trocar de tela/organização e após cada ação (msg)
  const { data } = useAsync(() => (orgId ? getAll('/requests?status=PENDING') : Promise.resolve([])), [orgId, route, msg])
  const pending = (data || []).filter(r => r.donorOrganizationId === orgId && r.status === 'PENDING').length

  const item = ([k, p]) => {
    const current = (route.page === k || pages[route.page]?.parent === k) && !(k === 'new' && route.param)
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
  const entries = Object.entries(pages).filter(([, p]) => !p.hidden)
  const mainEntries = entries.filter(([, p]) => !p.sec)
  const isAdmin = account?.role === 'ADMIN'

  return (
    <header className="shell">
      <p className="brand"><span className="logo"><Icon name="leaf" /></span>zestia</p>
      {/* o administrador sem organização não tem a navegação principal (evita barra inferior vazia) */}
      {mainEntries.length > 0 && <nav aria-label="Principal" className="nav-main"><ul>{mainEntries.map(item)}</ul></nav>}
      <nav aria-labelledby="nav-sec-t" className="nav-sec">
        <p id="nav-sec-t" className="nav-sec-title eyebrow">Gestão</p>
        <ul>{entries.filter(([, p]) => p.sec).map(item)}</ul>
      </nav>
      <div className="org-card">
        {org ? (
          <>
            <div className="mb-3 hidden items-center gap-3 md:flex">
              <Avatar name={org.name} type={org.type} className="h-10 w-10 text-sm" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{org.name}</p>
                <p className="text-xs text-muted">{TYPES[org.type]}</p>
              </div>
            </div>
            <p className={`status status-${verified ? 'AVAILABLE' : org.verificationStatus === 'PENDING' ? 'PENDING' : 'REJECTED'}`}>
              <Icon name={verified ? 'check' : 'clock'} size={14} />{VERIFICATION[org.verificationStatus] || org.verificationStatus}
            </p>
          </>
        ) : <p className="text-sm font-semibold">Conta sem organização</p>}
        {isAdmin && <p className="status status-APPROVED mt-2"><Icon name="shield" size={14} />Administrador</p>}
        <p className="mt-2 hidden truncate text-xs text-muted md:block" title={account?.email}>{account?.email}</p>
        <button type="button" className="btn sec mt-2 w-full" onClick={logout}><Icon name="logout" size={18} />Sair</button>
      </div>
    </header>
  )
}

import { useApp } from '../context'
import { TYPES } from '../constants'

const ICONS = {
  offers: (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
    </svg>
  ),
  foods: (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
    </svg>
  ),
  requests: (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  dashboard: (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  ),
  orgs: (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4" />
    </svg>
  ),
}

export default function Header({ pages, page, setPage, onQuickDonate }) {
  const { orgs, org, orgId, choose, pendingCount } = useApp()
  const initials = (org?.name || 'ZS')
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()

  return (
    <>
      {/* Topbar Mobile */}
      <header className="sticky top-0 z-20 border-b border-line bg-white/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-white">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
              </svg>
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-ink">Zestia</span>
          </div>

          {orgs.length > 0 && (
            <label className="flex items-center gap-1.5 text-xs font-semibold text-muted">
              <span className="sr-only">Atuando como:</span>
              <select
                aria-label="Atuando como"
                className="h-9 max-w-[190px] truncate rounded-xl border border-line bg-canvas px-2.5 text-xs font-semibold text-ink"
                value={orgId}
                onChange={e => choose(e.target.value)}
              >
                {orgs.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.name} ({TYPES[o.type]})
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      </header>

      {/* Sidebar Desktop (Zestia layout) */}
      <aside className="hidden md:sticky md:top-0 md:flex md:h-screen md:w-64 md:shrink-0 md:flex-col md:border-r md:border-line md:bg-white">
        <div className="flex items-center gap-2.5 px-5 py-6">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-white shadow-sm">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>
          </span>
          <span className="font-display text-[22px] font-bold tracking-tight text-ink">Zestia</span>
        </div>

        <nav aria-label="Principal" className="flex flex-1 flex-col gap-1 px-3">
          {Object.entries(pages).map(([k, [label]]) => {
            const active = page === k
            const showBadge = k === 'requests' && pendingCount > 0
            return (
              <button
                key={k}
                type="button"
                aria-current={active ? 'page' : undefined}
                onClick={() => setPage(k)}
                className={`flex min-h-[44px] w-full cursor-pointer items-center justify-between gap-2 rounded-xl px-3.5 text-left text-[14px] transition-colors ${
                  active
                    ? 'bg-primary-soft font-semibold text-primary-dark'
                    : 'font-medium text-muted hover:bg-canvas hover:text-ink'
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className={active ? 'text-primary' : 'text-muted'}>{ICONS[k]}</span>
                  <span>{label}</span>
                </span>
                {showBadge && (
                  <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-zest px-1.5 text-[11px] font-bold text-ink">
                    {pendingCount}
                  </span>
                )}
              </button>
            )
          })}

          {org && (
            <button
              type="button"
              onClick={onQuickDonate}
              className="mt-4 flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 text-[14px] font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
            >
              <span className="text-lg leading-none">+</span>
              <span>Nova doação</span>
            </button>
          )}
        </nav>

        {/* Perfil / Seletor da Organização Ativa no rodapé da Sidebar */}
        {orgs.length > 0 && (
          <div className="border-t border-line p-4">
            <div className="rounded-xl border border-line bg-canvas p-3">
              <div className="mb-2 flex items-center gap-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary-soft font-display text-xs font-bold text-primary-dark">
                  {initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-ink">{org?.name}</p>
                  <p className="truncate text-[11px] font-medium text-muted">{TYPES[org?.type]}</p>
                </div>
              </div>
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold text-muted">Atuando como:</span>
                <select
                  className="h-9 w-full rounded-lg border border-line bg-white px-2 text-xs font-semibold text-ink"
                  value={orgId}
                  onChange={e => choose(e.target.value)}
                >
                  {orgs.map(o => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({TYPES[o.type]})
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        )}
      </aside>

      {/* Bottom Navigation Mobile (Zestia mobile bar) */}
      <nav
        aria-label="Navegação rápida"
        className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-around border-t border-line bg-white px-1 py-1.5 md:hidden"
      >
        {Object.entries(pages).map(([k, [label]]) => {
          const active = page === k
          const showBadge = k === 'requests' && pendingCount > 0
          return (
            <button
              key={k}
              type="button"
              aria-current={active ? 'page' : undefined}
              onClick={() => setPage(k)}
              className={`relative flex min-h-[44px] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[11px] ${
                active ? 'font-bold text-primary' : 'font-medium text-muted'
              }`}
            >
              {ICONS[k]}
              {showBadge && (
                <span className="absolute right-3 top-1.5 h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
              )}
              <span className="max-w-[68px] truncate">{label.split(' ')[0]}</span>
            </button>
          )
        })}
      </nav>
    </>
  )
}

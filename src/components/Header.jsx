import { useApp } from '../context'
import { TYPES } from '../constants'
export default function Header({ pages, page, setPage }) {
  const { orgs, orgId, choose } = useApp()
  return (
    <header>
      <div className="bar">
        <span className="brand">ReAlimenta</span>
        <label className="row"><span>Atuando como:</span>
          <select value={orgId} onChange={e => choose(e.target.value)}>
            {orgs.map(o => <option key={o.id} value={o.id}>{o.name} ({TYPES[o.type]})</option>)}
          </select>
        </label>
      </div>
      <div className="bar">
        <nav aria-label="Principal">
          {Object.entries(pages).map(([k, [label]]) => (
            <button key={k} aria-current={page === k ? 'page' : undefined} onClick={() => setPage(k)}>{label}</button>
          ))}
        </nav>
      </div>
    </header>
  )
}

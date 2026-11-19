// Selos do guia visual. Todos combinam ícone + texto: a cor nunca é a única pista.
import Icon from './Icon'
import { STATUS } from '../constants'
import { expiry, initials } from '../format'

export function ExpirySeal({ date }) {
  const { level, text } = expiry(date)
  return <span className={`seal seal-${level}`}><Icon name="clock" size={14} />{text}</span>
}

const ORIGIN = { SUPERMARKET: ['Mercado', 'store', 'market'], NGO: ['ONG', 'heart', 'ngo'], COMMUNITY_KITCHEN: ['Cozinha', 'utensils', 'ngo'] }
export function OriginTag({ type }) {
  const o = ORIGIN[type]
  return o ? <span className={`tag tag-${o[2]}`}><Icon name={o[1]} size={14} />{o[0]}</span> : null
}

export function StatusBadge({ status, children }) {
  return <span className={`status status-${status}`}>{children || STATUS[status]}</span>
}

export function Avatar({ name, type, className = '' }) {
  return <span aria-hidden="true" className={`avatar ${type === 'SUPERMARKET' ? 'avatar-market' : ''} ${className}`}>{initials(name)}</span>
}

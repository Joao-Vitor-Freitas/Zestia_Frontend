import { STATUS } from '../constants'

export default function StatusBadge({ status }) {
  return <span className={`badge ${status}`}>{STATUS[status]}</span>
}

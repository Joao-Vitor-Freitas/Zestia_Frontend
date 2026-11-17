export const parseLocalExpiry = date => {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d, 23, 59, 59, 999)
}

export const expiry = date => {
  const h = (parseLocalExpiry(date) - Date.now()) / 36e5
  const color = h > 72 ? '#137A4D' : h > 24 ? '#D97706' : '#A8200D'
  const pillStyle =
    h <= 0
      ? 'bg-slate-200 text-slate-700'
      : h < 24
        ? 'bg-[#FDE3DE] text-[#A8200D]'
        : h <= 72
          ? 'bg-[#FEF0C7] text-[#874200]'
          : 'bg-[#DDF3E4] text-primary-dark'

  const days = Math.ceil(h / 24)
  const text = h <= 0 ? 'Vencido' : h < 24 ? 'Vence hoje' : `Vence em ${days} dia${days > 1 ? 's' : ''}`
  const chip = h <= 0 ? 'Vencido' : h < 24 ? 'Vence hoje' : h <= 48 ? 'Vence em 48h' : `Vence em ${days} dias`

  return { h, color, pillStyle, text, chip }
}

export default function ExpiryGauge({ date }) {
  const { h, color, text } = expiry(date)
  return (
    <div className="mt-1">
      <div className="gauge" aria-hidden="true">
        <i style={{ width: `${Math.max(6, Math.min(100, h / 0.72))}%`, background: color }} />
      </div>
      <small className="text-xs font-semibold" style={{ color }}>
        {text} ({new Date(date + 'T12:00').toLocaleDateString('pt-BR')})
      </small>
    </div>
  )
}

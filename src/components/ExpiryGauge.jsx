export default function ExpiryGauge({ date }) {
  const h = (new Date(date + 'T23:59:59') - Date.now()) / 36e5
  const color = h > 48 ? '#137A4D' : h > 24 ? '#D97706' : '#B91C1C'
  const text = h <= 0 ? 'Vencido' : h < 24 ? 'Vence hoje' : `Vence em ${Math.ceil(h / 24)} dia(s)`
  return (
    <div>
      <div className="gauge" aria-hidden="true"><i style={{ width: `${Math.max(5, Math.min(100, h / 0.72))}%`, background: color }} /></div>
      <small style={{ color, fontWeight: 700 }}>{text} ({new Date(date + 'T12:00').toLocaleDateString('pt-BR')})</small>
    </div>
  )
}

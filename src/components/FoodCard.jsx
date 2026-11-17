import ExpiryGauge, { expiry } from './ExpiryGauge'

function CategoryWatermark({ category = '' }) {
  const c = category.toLowerCase()
  if (c.includes('horti')) {
    return (
      <svg className="pointer-events-none absolute -bottom-2 -right-2 h-24 w-24 text-primary/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2a9 9 0 0 0-9 9c0 4.97 4.03 9 9 9s9-4.03 9-9a9 9 0 0 0-9-9Z" />
        <path d="M12 2c2.5 2.5 4 5.5 4 9s-1.5 6.5-4 9" />
        <path d="M12 2c-2.5 2.5-4 5.5-4 9s1.5 6.5 4 9" />
      </svg>
    )
  }
  if (c.includes('padaria') || c.includes('pão')) {
    return (
      <svg className="pointer-events-none absolute -bottom-2 -right-2 h-24 w-24 text-amber-900/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 13a8 8 0 0 1 16 0v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4Z" />
        <path d="M8 9v3M12 8v4M16 9v3" />
      </svg>
    )
  }
  if (c.includes('grão') || c.includes('cereal')) {
    return (
      <svg className="pointer-events-none absolute -bottom-2 -right-2 h-24 w-24 text-primary/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22V6M12 6c0-2.5 2-4 4-4 0 2.5-1.5 4-4 4ZM12 10c0-2.5-2-4-4-4 0 2.5 1.5 4 4 4ZM12 14c0-2.5 2-4 4-4 0 2.5-1.5 4-4 4ZM12 18c0-2.5-2-4-4-4 0 2.5 1.5 4 4 4Z" />
      </svg>
    )
  }
  return (
    <svg className="pointer-events-none absolute -bottom-2 -right-2 h-24 w-24 text-primary/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
    </svg>
  )
}

export default function FoodCard({ food, children }) {
  const e = expiry(food.expirationDate)
  const expired = e.h <= 0
  const out = food.availableKg <= 0
  const pctAvailable = food.quantityKg > 0 ? Math.max(0, Math.min(100, (food.availableKg / food.quantityKg) * 100)) : 0

  const headerTone =
    expired || out
      ? 'bg-slate-100 border-b border-line'
      : e.h < 24
        ? 'bg-[#FDE3DE]/45 border-b border-[#FDE3DE]'
        : e.h <= 72
          ? 'bg-[#FEF0C7]/55 border-b border-[#FEF0C7]'
          : 'bg-primary-soft/75 border-b border-primary/15'

  const statusTag = expired
    ? { label: 'Vencido', cls: 'bg-slate-200 text-slate-700' }
    : out
      ? { label: 'Esgotado', cls: 'bg-slate-200 text-slate-700' }
      : { label: 'Disponível', cls: 'bg-white text-primary-dark border border-primary/20' }

  return (
    <article className="card flex flex-col overflow-hidden p-0 transition-shadow hover:shadow-md">
      <div className={`relative flex min-h-[124px] flex-col justify-between overflow-hidden p-4 ${headerTone}`}>
        <CategoryWatermark category={food.category} />

        <div className="relative z-10 flex items-center justify-between gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold ${e.pillStyle}`}>
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
            </svg>
            {e.chip}
          </span>

          <span className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-2.5 py-1 text-[12px] font-semibold text-ink">
            <svg className="h-3.5 w-3.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
            {food.category}
          </span>
        </div>

        <div className="relative z-10 mt-4 flex items-center justify-between">
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusTag.cls}`}>
            {statusTag.label}
          </span>
          <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-bold text-ink">
            ≈ {food.availableKg} kg disp.
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h2 className="font-display text-[18px] font-bold leading-snug text-ink">{food.name}</h2>

        <div className="flex items-center gap-1.5 text-sm text-muted">
          <span className="sr-only">Doador</span>
          <strong className="font-medium text-ink">{food.donorName}</strong>
        </div>

        <div className="my-1.5 rounded-xl border border-line bg-canvas/70 p-2.5">
          <div className="flex items-baseline justify-between gap-2">
            <p className="metric flex items-baseline gap-1.5">
              <b className="!text-[24px]">{food.availableKg} kg</b>
              <span className="text-xs font-medium text-muted">de {food.quantityKg} kg</span>
            </p>
            <span className="text-[11px] font-bold text-primary-dark">{Math.round(pctAvailable)}% livre</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line" aria-hidden="true">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pctAvailable}%` }} />
          </div>
        </div>

        <ExpiryGauge date={food.expirationDate} />

        <div className="mt-auto flex flex-wrap gap-2 pt-3 [&>.btn]:w-full [&>button]:w-full">
          {children}
        </div>
      </div>
    </article>
  )
}

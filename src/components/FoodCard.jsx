import ExpiryGauge, { expiry } from './ExpiryGauge'
export default function FoodCard({ food, children }) {
  const e = expiry(food.expirationDate)
  const expired = e.h <= 0, out = food.availableKg <= 0
  // texto branco precisa de contraste >= 4,5:1: todos os degradês abaixo atendem
  const tone = expired || out ? 'from-slate-600 to-slate-800' : e.h <= 48 ? 'from-secondary-dark to-amber-900' : 'from-primary to-primary-dark'
  const label = expired ? ['Vencido', 'text-danger'] : out ? ['Esgotado', 'text-ink'] : ['Disponível', 'text-primary-dark']
  return (
    <article className="card flex flex-col overflow-hidden p-0">
      <div className={`relative flex min-h-36 flex-col justify-end bg-gradient-to-br p-4 text-white ${tone}`}>
        <span className={`badge absolute left-3 top-3 bg-white ${label[1]}`}>{label[0]}</span>
        <span className="absolute right-3 top-3 rounded bg-black/70 px-2 py-1 text-[11px] font-bold">{e.chip}</span>
        <small className="font-bold uppercase tracking-wider">{food.category}</small>
        <h2 className="font-bold leading-tight">{food.name}</h2>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <small className="text-slate-600">Doador</small>
        <strong>{food.donorName}</strong>
        <p className="metric my-1"><b>{food.availableKg} kg</b> <span className="text-slate-600">de {food.quantityKg} kg</span></p>
        <ExpiryGauge date={food.expirationDate} />
        <div className="row mt-auto">{children}</div>
      </div>
    </article>
  )
}

import { useId } from 'react'
import Icon from './Icon'
import { ExpirySeal, OriginTag } from './Badges'
import { fmtDate, fmtKg } from '../format'

const TINT = { 'Hortifrúti': '#E3F0DA', 'Padaria': '#F3E6D6', 'Laticínios': '#E6EBF5', 'Carnes': '#F6E1DE', 'Grãos e cereais': '#F3ECD3', 'Grãos': '#F3ECD3', 'Bebidas': '#DDEFF0' }
export const tint = c => TINT[c] || '#ECE7E1'

// Espaço reservado para foto: puramente decorativo.
export function Thumb({ category, className = '' }) {
  return (
    <div aria-hidden="true" className={`grid place-items-center rounded-xl text-[#8E978F] ${className}`} style={{ background: tint(category) }}>
      <Icon name="camera" size={28} />
    </div>
  )
}

// Card de lote (guia: selo de validade no topo à esquerda, origem à direita).
// No DOM o título vem primeiro (navegação por títulos); a faixa da foto é exibida acima via order-first.
export default function FoodCard({ food, type, as: H = 'h2', extra, children }) {
  const id = useId()
  return (
    <article className="card flex w-full flex-col overflow-hidden p-0" aria-labelledby={id}>
      <div className="flex flex-1 flex-col gap-1 p-5">
        <H id={id} className="font-display text-lg font-semibold leading-6">{food.name}</H>
        <p className="text-sm text-muted">{[food.donorName, food.category].filter(Boolean).join(' · ')}</p>
        <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted">
          <li><strong className="font-semibold text-ink">{fmtKg(food.availableKg)}</strong>{food.availableKg !== food.quantityKg ? ` de ${fmtKg(food.quantityKg)}` : ' disponíveis'}</li>
          {food.expirationDate && <li>validade {fmtDate(food.expirationDate)}</li>}
        </ul>
        {extra}
        {children && <div className="mt-auto flex flex-wrap gap-2 pt-4">{children}</div>}
      </div>
      <div className="relative order-first h-32" style={{ background: tint(food.category) }}>
        <Icon name="camera" size={32} className="absolute inset-0 m-auto text-[#8E978F]" />
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          {food.expirationDate ? <ExpirySeal date={food.expirationDate} /> : <span />}
          <OriginTag type={type} />
        </div>
      </div>
    </article>
  )
}

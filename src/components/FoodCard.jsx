import ExpiryGauge from './ExpiryGauge'
export default function FoodCard({ food, children }) {
  return (
    <article className="card">
      <small>{food.category}</small>
      <h2>{food.name}</h2>
      <p>{food.donorName}</p>
      <p className="metric"><b>{food.availableKg} kg</b> disponíveis de {food.quantityKg} kg</p>
      <ExpiryGauge date={food.expirationDate} />
      <div className="row">{children}</div>
    </article>
  )
}

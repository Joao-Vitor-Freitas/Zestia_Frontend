export default function MetricCard({ label, value }) {
  return (
    <div className="card metric flex flex-col justify-between gap-2">
      <b>{value}</b>
      <div className="text-sm font-medium text-muted">{label}</div>
    </div>
  )
}

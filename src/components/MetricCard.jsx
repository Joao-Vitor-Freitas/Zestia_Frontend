export default function MetricCard({ label, value }) {
  return <div className="card metric"><b>{value}</b><div>{label}</div></div>
}

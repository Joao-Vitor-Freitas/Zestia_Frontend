export default function PageHeader({ title, sub, actions }) {
  return (
    <header className="page-head">
      <div className="min-w-0">
        <h1>{title}</h1>
        {sub && <p className="mt-1 text-muted">{sub}</p>}
      </div>
      {actions && <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">{actions}</div>}
    </header>
  )
}

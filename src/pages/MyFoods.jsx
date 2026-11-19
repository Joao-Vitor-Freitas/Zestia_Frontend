import { api } from '../services/api'
import { useApp } from '../context'
import { useAsync } from '../hooks/useAsync'
import { useBusy } from '../hooks/useBusy'
import { expiry } from '../format'
import AsyncView from '../components/AsyncView'
import PageHeader from '../components/PageHeader'
import FoodCard from '../components/FoodCard'
import Button from '../components/Button'
import Icon from '../components/Icon'
import { StatusBadge } from '../components/Badges'

const lotStatus = f => expiry(f.expirationDate).expired ? ['DONE', 'Vencido'] : f.availableKg <= 0 ? ['DONE', 'Esgotado'] : ['AVAILABLE', 'Disponível']

export default function MyFoods({ go }) {
  const { org, orgId, notify } = useApp()
  const [busy, run] = useBusy()
  const { data, loading, error, reload } = useAsync(() => api.get('/foods'), [orgId])
  const mine = (data || []).filter(f => f.donorOrganizationId === orgId).sort((a, b) => a.expirationDate.localeCompare(b.expirationDate))
  const remove = async f => {
    if (!confirm(`Excluir o lote "${f.name}"?`)) return
    await run(async () => { try { await api.del(`/foods/${f.id}`); notify('Lote excluído.'); reload() } catch (x) { notify(x.message, 'error') } })
  }
  return (
    <>
      <PageHeader title="Meus lotes" sub="Doações publicadas pela sua organização, das que vencem antes para as mais distantes." />
      <AsyncView data={data} loading={loading} error={error} onRetry={reload} empty={!mine.length}
        emptyText={<><p>Você ainda não publicou nenhum lote.</p><Button variant="zest" className="mt-4" onClick={() => go('new')}><Icon name="plus" />Publicar primeira doação</Button></>}>
        <ul className="grid-cards">
          {mine.map(f => {
            const [st, label] = lotStatus(f), noteId = `lock-${f.id}`
            return (
              <li key={f.id} className="flex">
                <FoodCard food={f} type={org?.type} extra={
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <StatusBadge status={st}>{label}</StatusBadge>
                    {f.hasRequests && <StatusBadge status="PENDING">Com requisições</StatusBadge>}
                  </div>
                }>
                  <Button variant="sec" className="flex-1" aria-label={`Editar ${f.name}`} onClick={() => go('new', f)}><Icon name="pencil" size={18} />Editar</Button>
                  <Button variant="del" className="flex-1" disabled={busy || f.hasRequests} aria-describedby={f.hasRequests ? noteId : undefined} aria-label={`Excluir ${f.name}`} onClick={() => remove(f)}><Icon name="trash" size={18} />Excluir</Button>
                  {f.hasRequests && <p id={noteId} className="hint w-full">Lotes com requisições não podem ser excluídos.</p>}
                </FoodCard>
              </li>
            )
          })}
        </ul>
      </AsyncView>
    </>
  )
}

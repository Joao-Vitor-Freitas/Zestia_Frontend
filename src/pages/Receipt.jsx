import { api } from '../services/api'
import { useId } from 'react'
import { useApp } from '../context'
import { useAsync } from '../hooks/useAsync'
import { fmtDate, fmtKg } from '../format'
import AsyncView from '../components/AsyncView'
import PageHeader from '../components/PageHeader'
import Button from '../components/Button'
import Icon from '../components/Icon'
import { ExpirySeal } from '../components/Badges'

// Código de exibição derivado do ID da requisição (a API ainda não gera código de retirada próprio).
export const pickupCode = id => `ZST-${String(parseInt(id.replace(/-/g, '').slice(0, 8), 16) % 10000).padStart(4, '0')}`
const time = iso => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

// Resumo da aprovação (guia p. 6 e 11). param = { id } da requisição.
export default function Receipt({ go, param }) {
  const { orgId, orgs } = useApp()
  const ids = useId()
  const { data, loading, error, reload } = useAsync(async () => { const request = await api.get(`/requests/${param.id}`); const food = await api.get(`/foods/${request.foodId}`); const donor = await api.get(`/organizations/${request.donorOrganizationId}`); return [[food], [{ ...request, foodName: food.name, donorName: donor.name }]] }, [orgId, orgs])
  const [foods, reqs] = data || [[], []]
  const r = reqs.find(x => x.id === param?.id)
  const f = r && foods.find(x => x.id === r.foodId)
  const donor = r && orgs.find(o => o.id === r.donorOrganizationId)
  const approved = r?.status === 'APPROVED'

  return (
    <>
      <button type="button" className="link mb-1 text-sm" onClick={() => go('sent')}>← Minhas requisições</button>
      <PageHeader title="Resumo da aprovação"
        actions={approved && <Button variant="sec" onClick={() => window.print()}>Imprimir</Button>} />
      <AsyncView data={data} loading={loading} error={error} onRetry={reload} empty={!r} emptyText="Requisição não encontrada.">
        {r && !approved && (
          <p className="info"><Icon name="info" size={18} className="mt-0.5" />O comprovante fica disponível depois que {r.donorName} aprovar a requisição.</p>
        )}
        {r && approved && (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            <section aria-labelledby={`${ids}c`} className="rounded-2xl bg-primary p-6 text-white md:p-8">
              <p className="flex items-center gap-3 text-lg font-semibold">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-zest text-ink"><Icon name="check" size={20} /></span>
                Aprovado para retirada
              </p>
              <h2 id={`${ids}c`} className="mt-8 font-sans text-sm font-normal text-white/80">Referência do pedido</h2>
              <p className="font-display text-[44px] font-bold leading-[52px] tracking-wide">{pickupCode(r.id)}</p>
              <p className="mt-2 text-sm text-white/80">Referência visual; não é um código de autenticação ou comprovante de entrega.</p>
            </section>

            <div className="grid gap-6">
              <section aria-label="Detalhes da retirada" className="card grid gap-6 sm:grid-cols-2 md:p-6">
                <div className="flex gap-3">
                  <Icon name="box" className="mt-0.5 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm text-muted">Lote</p>
                    <p className="font-display text-lg font-semibold leading-6">{r.foodName} · {fmtKg(r.quantityKg)}</p>
                    {f && <div className="mt-2"><ExpirySeal date={f.expirationDate} /></div>}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Icon name="store" className="mt-0.5 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm text-muted">Doador</p>
                    <p className="font-display text-lg font-semibold leading-6">{r.donorName}</p>
                    {donor?.location && <p className="text-sm text-muted">{donor.location}</p>}
                  </div>
                </div>
                {f && (
                  <div className="flex gap-3">
                    <Icon name="clock" className="mt-0.5 shrink-0 text-primary" />
                    <div>
                      <p className="text-sm text-muted">Validade do lote</p>
                      <p className="font-display text-lg font-semibold leading-6">{fmtDate(f.expirationDate)}</p>
                    </div>
                  </div>
                )}
              </section>

              <section aria-labelledby={`${ids}a`} className="card md:p-6">
                <h2 id={`${ids}a`} className="font-sans text-base font-bold">Andamento</h2>
                <ol className="mt-5 grid grid-cols-3 text-center text-sm font-semibold">
                  <li className="grid justify-items-center gap-1 text-primary"><span aria-hidden="true" className="h-3.5 w-3.5 rounded-full bg-primary" />Requisitado<span className="font-normal text-muted">{time(r.createdAt)}</span></li>
                  <li aria-current="step" className="grid justify-items-center gap-1 text-primary"><span aria-hidden="true" className="h-3.5 w-3.5 rounded-full bg-primary ring-4 ring-zest" />Aprovado</li>
                  <li className="grid justify-items-center gap-1 text-muted"><span aria-hidden="true" className="h-3.5 w-3.5 rounded-full bg-line-strong" />Entrega<span className="font-normal">não confirmada</span></li>
                </ol>
              </section>
            </div>
          </div>
        )}
      </AsyncView>
    </>
  )
}

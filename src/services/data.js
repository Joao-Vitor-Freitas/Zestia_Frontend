// Monta os dados "prontos para tela" a partir das respostas cruas da zestia-api.
// A API devolve só IDs; aqui juntamos nomes, saldo disponível e outras informações derivadas.
import { api } from './api'

const PAGE = 100 // limite máximo aceito pela API por chamada

/** Busca todas as páginas de uma listagem (?offset=&limit=). */
export async function getAll(path) {
  const sep = path.includes('?') ? '&' : '?'
  const all = []
  for (let offset = 0; ; offset += PAGE) {
    const page = await api.get(`${path}${sep}offset=${offset}&limit=${PAGE}`)
    all.push(...page)
    if (page.length < PAGE) return all
  }
}

const r3 = n => Math.round(n * 1000) / 1000
const nameOf = orgs => id => orgs.find(o => o.id === id)?.name || 'Organização removida'

// Saldo agregado pelo servidor, incluindo aprovações a terceiros sem expor o histórico privado.
export async function loadNetwork(orgs) {
  const [foods, reqs] = await Promise.all([getAll('/foods'), getAll('/requests')])
  const name = nameOf(orgs)
  const enrichedFoods = await Promise.all(foods.map(async f => {
    const availability = await api.get(`/foods/${f.id}/availability`)
    return { ...f, donorName: name(f.donorOrganizationId),
      approvedKg: r3(f.quantityKg - availability.availableKg),
      availableKg: availability.availableKg, hasRequests: availability.hasRequests }
  }))
  const foodName = id => foods.find(f => f.id === id)?.name || 'Alimento removido'
  const enrichedReqs = reqs.map(r => ({ ...r, foodName: foodName(r.foodId), donorName: name(r.donorOrganizationId), recipientName: name(r.recipientOrganizationId) }))
  return [enrichedFoods, enrichedReqs]
}

/** GET /metrics no formato achatado usado pelo Painel. */
export async function loadMetrics(organizationId, status) {
  const m = await api.get(`/metrics?organizationId=${organizationId}&status=${status}`)
  const q = m.requests
  return {
    organizations: m.totalOrganizations,
    registeredKg: m.registeredFoodKg,
    requestedKg: q.requestedFoodKg,
    approvedKg: q.approvedFoodKg,
    pending: q.pendingRequests,
    approved: q.approvedRequests,
    rejected: q.rejectedRequests,
  }
}

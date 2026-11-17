const K = 'zestia-mock', TYPES = ['SUPERMARKET', 'NGO', 'COMMUNITY_KITCHEN']
const uid = () => crypto.randomUUID()
const day = n => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toLocaleDateString('sv')
}
const seed = () => {
  const o = [['Supermercado Zaffari Ipiranga', 'SUPERMARKET', 'Porto Alegre'], ['ONG Mesa Solidária', 'NGO', 'Viamão'], ['Cozinha Comunitária Esperança', 'COMMUNITY_KITCHEN', 'Restinga']].map(([name, type, location]) => ({ id: uid(), name, type, location }))
  const f = (i, name, category, quantityKg, d) => ({ id: uid(), donorOrganizationId: o[i].id, name, category, quantityKg, expirationDate: day(d) })
  return { orgs: o, foods: [f(0, 'Tomates, cenouras e abobrinhas', 'Hortifrúti', 35, 2), f(0, 'Pães integrais e torradas', 'Padaria', 22, 1), f(1, 'Arroz e feijão', 'Grãos', 80, 30)], reqs: [] }
}
let db = JSON.parse(localStorage.getItem(K) || 'null') || seed()
const fail = m => { throw new Error(m) }
const r3 = n => Math.round(n * 1000) / 1000
const sum = (a, g = x => x.quantityKg) => r3(a.reduce((s, x) => s + Number(g(x)), 0))
const approved = fid => sum(db.reqs.filter(r => r.foodId === fid && r.status === 'APPROVED'))

export async function mock(method, path, body = {}) {
  await new Promise(r => setTimeout(r, 250))
  const [p, qs] = path.split('?'), q = new URLSearchParams(qs), [, res, id, act] = p.split('/')
  const me = localStorage.getItem('orgId')
  const org = db.orgs.find(o => o.id === id), food = db.foods.find(f => f.id === id), req = db.reqs.find(r => r.id === id)
  const name = i => db.orgs.find(o => o.id === i)?.name
  const mine = () => food.donorOrganizationId === me || fail('Somente a organização doadora pode fazer isso.')
  if (id && method !== 'GET' && res !== 'requests' && !org && !food) fail('Registro não encontrado.')
  const k = `${method} ${res}${act ? '/' + act : ''}`
  let out = null
  if (k === 'GET organizations') out = db.orgs
  else if (k === 'POST organizations' || k === 'PUT organizations') {
    const cleanName = body.name?.trim(), cleanLoc = (body.location || '').trim()
    if (!cleanName || !TYPES.includes(body.type)) fail('Informe o nome e um tipo válido.')
    if (org) out = Object.assign(org, { name: cleanName, type: body.type, location: cleanLoc })
    else db.orgs.push(out = { id: uid(), name: cleanName, type: body.type, location: cleanLoc })
  } else if (k === 'DELETE organizations') {
    if (db.foods.some(f => f.donorOrganizationId === id) || db.reqs.some(r => r.recipientOrganizationId === id)) fail('Organização com alimentos ou solicitações não pode ser excluída.')
    db.orgs = db.orgs.filter(o => o !== org)
  } else if (k === 'GET foods') out = db.foods.map(f => ({ ...f, donorName: name(f.donorOrganizationId), availableKg: r3(f.quantityKg - approved(f.id)), hasRequests: db.reqs.some(r => r.foodId === f.id) }))
  else if (k === 'POST foods' || k === 'PUT foods') {
    const n = Number(body.quantityKg), v = { name: body.name?.trim(), category: body.category?.trim(), quantityKg: n, expirationDate: body.expirationDate }
    if (!v.name || !v.category || !(n > 0) || !v.expirationDate) fail('Nome, categoria, quantidade (> 0) e validade são obrigatórios.')
    if (v.expirationDate < day(0)) fail('Não é possível salvar alimento já vencido.')
    if (food) { mine(); if (n < approved(id)) fail('Quantidade menor que o total já aprovado.'); out = Object.assign(food, v) }
    else { db.foods.push(out = { id: uid(), donorOrganizationId: me, ...v }) }
  } else if (k === 'DELETE foods') { mine(); if (db.reqs.some(r => r.foodId === id)) fail('Alimento com solicitações não pode ser excluído.'); db.foods = db.foods.filter(f => f !== food) }
  else if (k === 'GET requests') out = db.reqs.map(r => { const f = db.foods.find(x => x.id === r.foodId); return { ...r, foodName: f?.name || 'Alimento removido', donorOrganizationId: f?.donorOrganizationId, donorName: name(f?.donorOrganizationId), recipientName: name(r.recipientOrganizationId) } })
  else if (k === 'POST requests') {
    const f = db.foods.find(x => x.id === body.foodId), n = Number(body.quantityKg)
    if (!f) fail('Alimento não encontrado.')
    if (f.donorOrganizationId === me) fail('Não é possível solicitar o próprio alimento.')
    if (f.expirationDate < day(0)) fail('Alimento vencido não pode ser solicitado.')
    if (!(n > 0) || n > r3(f.quantityKg - approved(f.id))) fail('Quantidade inválida ou acima da disponível.')
    db.reqs.push(out = { id: uid(), foodId: f.id, recipientOrganizationId: me, quantityKg: n, status: 'PENDING', createdAt: new Date().toISOString() })
  } else if (k === 'POST requests/approve' || k === 'POST requests/reject') {
    if (!req) fail('Solicitação não encontrada.')
    const f = db.foods.find(x => x.id === req.foodId)
    if (!f) fail('Alimento vinculado não encontrado.')
    if (f.donorOrganizationId !== me) fail('Somente a organização doadora pode processar.')
    if (req.status !== 'PENDING') fail('Solicitação já processada.')
    if (act === 'approve' && r3(approved(f.id) + req.quantityKg) > f.quantityKg) fail('A aprovação excede a quantidade registrada.')
    req.status = act === 'approve' ? 'APPROVED' : 'REJECTED'; out = req
  } else if (k === 'GET metrics') {
    const o = q.get('organizationId'), s = q.get('status')
    const foods = db.foods.filter(f => !o || f.donorOrganizationId === o)
    const reqs = db.reqs.filter(r => (!o || r.recipientOrganizationId === o || db.foods.find(f => f.id === r.foodId)?.donorOrganizationId === o) && (!s || r.status === s))
    const by = st => reqs.filter(r => r.status === st)
    out = { organizations: db.orgs.length, registeredKg: sum(foods), requestedKg: sum(reqs), approvedKg: sum(by('APPROVED')), pending: by('PENDING').length, approved: by('APPROVED').length, rejected: by('REJECTED').length }
  } else fail('Rota não encontrada.')
  localStorage.setItem(K, JSON.stringify(db))
  return out
}

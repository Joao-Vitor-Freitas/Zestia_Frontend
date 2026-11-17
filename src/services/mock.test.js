let m, zaf, ong, coz, tom
const as = o => localStorage.setItem('orgId', o.id)
const rej = (p, msg) => expect(p).rejects.toThrow(msg)
beforeEach(async () => {
  localStorage.clear(); vi.resetModules()
  ;({ mock: m } = await import('./mock'))
  ;[zaf, ong, coz] = await m('GET', '/organizations')
  tom = (await m('GET', '/foods'))[0]
})

it('RN-07/08: bloqueia pedido do próprio alimento, quantidade zero e acima do disponível', async () => {
  as(zaf); await rej(m('POST', '/requests', { foodId: tom.id, quantityKg: 1 }), /próprio/)
  as(coz); await rej(m('POST', '/requests', { foodId: tom.id, quantityKg: 36 }), /acima/)
  await rej(m('POST', '/requests', { foodId: tom.id, quantityKg: 0 }), /inválida/)
})
it('RN-07: bloqueia pedido de alimento vencido', async () => {
  vi.resetModules(); localStorage.setItem('zestia-mock', JSON.stringify({ orgs: [zaf, coz], foods: [{ ...tom, expirationDate: '2020-01-01' }], reqs: [] }))
  ;({ mock: m } = await import('./mock')); as(coz)
  await rej(m('POST', '/requests', { foodId: tom.id, quantityKg: 1 }), /vencido/)
})
it('RN-08/10: pendentes não reservam; aprovações conflitantes nunca passam do registrado', async () => {
  as(coz)
  const a = await m('POST', '/requests', { foodId: tom.id, quantityKg: 10 })
  const b = await m('POST', '/requests', { foodId: tom.id, quantityKg: 30 })
  as(zaf); await m('POST', `/requests/${a.id}/approve`)
  await rej(m('POST', `/requests/${b.id}/approve`), /excede/)
  await rej(m('POST', `/requests/${a.id}/approve`), /já processada/)
  expect((await m('POST', `/requests/${b.id}/reject`)).status).toBe('REJECTED')
  await rej(m('POST', `/requests/${b.id}/reject`), /já processada/)
  expect((await m('GET', '/foods'))[0].availableKg).toBe(25)
})
it('RN-09: só o doador aprova ou rejeita', async () => {
  as(coz); const a = await m('POST', '/requests', { foodId: tom.id, quantityKg: 5 })
  await rej(m('POST', `/requests/${a.id}/approve`), /doadora/)
})
it('RN-05/06: só o dono edita; alimento com pedido não exclui nem baixa abaixo do aprovado', async () => {
  as(coz); const a = await m('POST', '/requests', { foodId: tom.id, quantityKg: 10 })
  const body = { name: 'x', category: 'y', quantityKg: 5, expirationDate: '2030-01-01' }
  await rej(m('PUT', `/foods/${tom.id}`, body), /doadora/)
  as(zaf); await m('POST', `/requests/${a.id}/approve`)
  await rej(m('PUT', `/foods/${tom.id}`, body), /total já aprovado/)
  await rej(m('DELETE', `/foods/${tom.id}`), /solicitações/)
  expect((await m('GET', '/foods'))[0].hasRequests).toBe(true)
})
it('RN-01/02/04: validações de cadastro, edição e exclusão de organização', async () => {
  await rej(m('POST', '/organizations', { name: '', type: 'NGO' }), /obrigat|Informe/)
  await rej(m('DELETE', `/organizations/${zaf.id}`), /não pode ser excluída/)
  as(zaf)
  await rej(m('POST', '/foods', { name: 'Leite', category: 'Laticínios', quantityKg: 5, expirationDate: '2020-01-01' }), /vencido/)
  await rej(m('PUT', `/foods/${tom.id}`, { name: 'Tomates', category: 'Hortifrúti', quantityKg: 35, expirationDate: '2020-01-01' }), /vencido/)
  await rej(m('PUT', '/foods/xxx', { name: 'a', category: 'b', quantityKg: 1, expirationDate: '2030-01-01' }), /não encontrado/)
})
it('RN-12/13: métricas calculadas dos registros e sem erro de ponto flutuante', async () => {
  as(zaf); const f = await m('POST', '/foods', { name: 'D', category: 'c', quantityKg: 0.3, expirationDate: '2030-01-01' })
  as(coz)
  const a = await m('POST', '/requests', { foodId: f.id, quantityKg: 0.1 }), b = await m('POST', '/requests', { foodId: f.id, quantityKg: 0.2 })
  as(zaf); await m('POST', `/requests/${a.id}/approve`); await m('POST', `/requests/${b.id}/approve`)
  expect((await m('GET', '/foods')).find(x => x.id === f.id).availableKg).toBe(0)
  expect(await m('GET', '/metrics?organizationId=&status=')).toMatchObject({ organizations: 3, approved: 2, pending: 0, approvedKg: 0.3 })
})

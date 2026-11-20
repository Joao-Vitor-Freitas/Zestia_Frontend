import { afterEach, expect, it, vi } from 'vitest'
async function setup(reply = {}, status = 200) {
  vi.resetModules(); localStorage.clear(); vi.stubEnv('VITE_API_URL', 'https://api.example.test')
  const fetcher = vi.fn(async () => ({ ok: status < 400, status, json: async () => reply }))
  vi.stubGlobal('fetch', fetcher)
  return { ...(await import('./api')), fetcher }
}
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.unstubAllEnvs() })
it('normaliza URL, token, Decimal e snake_case', async () => {
  const { api, setToken, fetcher } = await setup({ quantity_kg: '1.125', donor_organization_id: 'owner' })
  setToken('synthetic-session')
  expect(await api.post('/foods', { quantityKg: 1.125, expirationDate: '2099-01-01' })).toEqual({ quantityKg: 1.125, donorOrganizationId: 'owner' })
  expect(fetcher.mock.calls[0][0]).toBe('https://api.example.test/api/v1/foods')
  expect(fetcher.mock.calls[0][1].headers.Authorization).toBe('Bearer synthetic-session')
  expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual({ quantity_kg: 1.125, expiration_date: '2099-01-01' })
})
it('converte filtro e remove valores vazios', async () => {
  const { api, fetcher } = await setup()
  await api.get('/metrics?organizationId=org&status=')
  expect(fetcher.mock.calls[0][0]).toBe('https://api.example.test/api/v1/metrics?organization_id=org')
})
it('saúde usa a raiz da API, sem prefixo /api/v1', async () => {
  const { api, fetcher } = await setup({ status: 'ready' })
  await api.get('/health/ready')
  expect(fetcher.mock.calls[0][0]).toBe('https://api.example.test/health/ready')
})
it('401 limpa a sessão e notifica o contexto', async () => {
  const { api, setToken, getToken, setUnauthorizedHandler } = await setup({ error: { code: 'invalid_token' } }, 401)
  const invalid = vi.fn(); setUnauthorizedHandler(invalid); setToken('synthetic-session')
  await expect(api.get('/auth/me')).rejects.toThrow('Sua sessão expirou')
  expect(getToken()).toBe(''); expect(invalid).toHaveBeenCalledOnce()
})
it('204 não tenta ler JSON e preserva método DELETE', async () => {
  const { api, fetcher } = await setup(null, 204)
  expect(await api.del('/foods/id')).toBeNull()
  expect(fetcher.mock.calls[0][1].method).toBe('DELETE')
})
it('paginação busca registros além da primeira página', async () => {
  const { fetcher } = await setup()
  fetcher.mockResolvedValueOnce({ ok: true, status: 200, json: async () => Array.from({ length: 100 }, (_, id) => ({ id })) })
    .mockResolvedValueOnce({ ok: true, status: 200, json: async () => [{ id: 100 }] })
  const { getAll } = await import('./data')
  expect(await getAll('/organizations')).toHaveLength(101)
  expect(fetcher.mock.calls[1][0]).toContain('offset=100&limit=100')
})
it('saldo usa aprovações a terceiros agregadas no servidor e não o histórico visível', async () => {
  const { fetcher } = await setup()
  fetcher.mockImplementation(async url => ({ ok: true, status: 200, json: async () =>
    url.includes('/availability') ? { available_kg: '2.125', has_requests: true } : url.includes('/foods')
      ? [{ id: 'food', donor_organization_id: 'donor', quantity_kg: '10.000' }] : [] }))
  const { loadNetwork } = await import('./data')
  const [foods, requests] = await loadNetwork([{ id: 'donor', name: 'Mercado' }])
  expect(requests).toEqual([])
  expect(foods[0]).toMatchObject({ availableKg: 2.125, approvedKg: 7.875, hasRequests: true })
})

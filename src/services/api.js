// Camada de acesso a dados. Com VITE_API_URL usa a API real; sem ela, usa o mock.
import { mock } from './mock'
const BASE = import.meta.env.VITE_API_URL
let orgId = ''
export const setOrg = id => { orgId = id }
async function http(method, path, body) {
  const r = await fetch(BASE + path, { method, headers: { 'Content-Type': 'application/json', 'X-Organization-Id': orgId }, body: body && JSON.stringify(body) })
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || `Erro ${r.status}`)
  return r.status === 204 ? null : r.json()
}
const call = (m, p, b) => (BASE ? http(m, p, b) : mock(m, p, b))
export const api = { get: p => call('GET', p), post: (p, b) => call('POST', p, b), put: (p, b) => call('PUT', p, b), del: p => call('DELETE', p) }

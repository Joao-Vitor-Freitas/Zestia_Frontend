import { mock } from './mock'
const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')
export const DEMO = !BASE
let orgId = ''
export const setOrg = id => { orgId = id }
async function http(method, path, body) {
  let r
  try {
    r = await fetch(BASE + path, { method, headers: { 'Content-Type': 'application/json', 'X-Organization-Id': orgId }, body: body && JSON.stringify(body) })
  } catch {
    throw new Error('Não foi possível conectar à API. Verifique a URL configurada e sua conexão.')
  }
  if (!r.ok) {
    const e = await r.json().catch(() => ({}))
    const d = Array.isArray(e.detail) ? e.detail.map(x => x.msg).join('; ') : e.detail
    throw new Error(d || e.message || `Erro ${r.status}`)
  }
  return r.status === 204 ? null : r.json()
}
const call = (m, p, b) => (BASE ? http(m, p, b) : mock(m, p, b))
export const api = { get: p => call('GET', p), post: (p, b) => call('POST', p, b), put: (p, b) => call('PUT', p, b), del: p => call('DELETE', p) }

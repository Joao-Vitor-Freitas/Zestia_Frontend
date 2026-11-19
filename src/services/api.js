// Camada de acesso a dados. Com VITE_API_URL usa a API real (zestia-api); sem ela, usa o mock (modo demonstração).
// Responsabilidades: prefixo da URL, token de login, conversão camelCase <-> snake_case e tradução dos erros.
import { mock } from './mock'
const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')
export const DEMO = !BASE

// --- Sessão (token JWT) ---------------------------------------------------
const TOKEN_KEY = 'token'
let token = localStorage.getItem(TOKEN_KEY) || ''
let onUnauthorized = () => {}
export const getToken = () => token
export const setToken = t => { token = t || ''; t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY) }
/** Chamado quando a API responde 401 (token expirado/inválido), para a tela voltar ao login. */
export const setUnauthorizedHandler = fn => { onUnauthorized = fn }

// Mantido para o modo demonstração (o mock identifica a organização pelo localStorage).
export const setOrg = () => {}

// --- Conversão de nomes ------------------------------------------------------
const camel = s => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
const snake = s => s.replace(/[A-Z]/g, c => '_' + c.toLowerCase())
const mapKeys = (v, fn, conv) =>
  Array.isArray(v) ? v.map(x => mapKeys(x, fn, conv))
    : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [fn(k), conv(fn(k), mapKeys(x, fn, conv))]))
    : v
// A API devolve quantidades (Decimal) como texto "1.125"; o front trabalha com números.
const fromApi = d => mapKeys(d, camel, (k, x) => (/Kg$/.test(k) && typeof x === 'string' ? Number(x) : x))
const toApi = d => mapKeys(d, snake, (_, x) => x)
// Converte os parâmetros da URL também: /metrics?organizationId=1 -> /metrics?organization_id=1 (vazios são removidos).
const toApiPath = path => {
  const [p, qs] = path.split('?')
  if (!qs) return p
  const q = new URLSearchParams()
  for (const [k, v] of new URLSearchParams(qs)) if (v !== '') q.append(snake(k), v)
  const s = q.toString()
  return s ? `${p}?${s}` : p
}

// --- Erros -----------------------------------------------------------------
const MESSAGES = {
  invalid_credentials: 'E-mail ou senha incorretos.',
  email_registered: 'Este e-mail já está cadastrado.',
  email_unavailable: 'Este e-mail não pode ser usado para cadastro.',
  invalid_password: 'A senha deve ter de 8 a 128 caracteres.',
  missing_token: 'Sua sessão expirou. Entre novamente.',
  invalid_token: 'Sua sessão expirou. Entre novamente.',
  organization_exists: 'Esta conta já possui uma organização.',
  organization_required: 'Cadastre sua organização antes de continuar.',
  organization_unverified: 'Sua organização ainda não foi verificada pelo administrador.',
  organization_not_found: 'Organização não encontrada.',
  not_owner: 'Somente a organização dona pode fazer isso.',
  not_donor: 'Somente a organização doadora pode processar esta requisição.',
  food_not_found: 'Alimento não encontrado.',
  food_expired: 'Alimento vencido: a validade deve ser hoje ou depois.',
  food_quantity_below_approved: 'Quantidade menor que o total já aprovado.',
  insufficient_food: 'Quantidade acima da disponível.',
  invalid_food_quantity: 'Quantidade inválida.',
  invalid_request_quantity: 'Quantidade inválida ou acima da disponível.',
  own_food_request: 'Não é possível solicitar o próprio alimento.',
  request_not_found: 'Requisição não encontrada.',
  request_already_processed: 'Esta requisição já foi processada.',
  request_access_denied: 'Você não tem acesso a esta requisição.',
  admin_required: 'Ação permitida somente ao administrador.',
  self_review: 'O administrador não pode revisar a própria organização.',
  invalid_evidence: 'A comprovação deve ter de 20 a 1000 caracteres.',
  data_conflict: 'Operação em conflito com dados existentes (registro em uso).',
  database_unavailable: 'Banco de dados indisponível. Tente novamente em instantes.',
  validation_error: 'Dados inválidos. Confira os campos.',
}
const errorMessage = (body, status) => {
  const e = body?.error
  if (e) return MESSAGES[e.code] || e.message || `Erro ${status}`
  return body?.detail || `Erro ${status}`
}

// --- HTTP ------------------------------------------------------------------
async function http(method, path, body) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  let r
  try {
    r = await fetch(BASE + toApiPath(path), { method, headers, body: body && JSON.stringify(toApi(body)) })
  } catch {
    throw new Error('Não foi possível conectar à API. Verifique a URL configurada e sua conexão.')
  }
  if (!r.ok) {
    const e = await r.json().catch(() => ({}))
    if (r.status === 401 && token) { setToken(''); onUnauthorized() }
    const err = new Error(errorMessage(e, r.status))
    err.status = r.status; err.code = e?.error?.code
    throw err
  }
  return r.status === 204 || r.status === 202 ? null : fromApi(await r.json())
}

const call = (m, p, b) => (BASE ? http(m, p, b) : mock(m, p, b))
export const api = { get: p => call('GET', p), post: (p, b) => call('POST', p, b), put: (p, b) => call('PUT', p, b), del: p => call('DELETE', p) }

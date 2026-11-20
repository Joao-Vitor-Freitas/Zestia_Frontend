// Camada de acesso a dados da zestia-api (VITE_API_URL, ex.: http://localhost:8001/api/v1).
// Responsabilidades: token de login, conversão camelCase <-> snake_case e tradução dos erros.
const configured = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '')
const BASE = configured ? configured.replace(/(?:\/api\/v1)?$/, '/api/v1') : ''

// --- Sessão (token JWT) ---------------------------------------------------
const TOKEN_KEY = 'token'
let token = localStorage.getItem(TOKEN_KEY) || ''
let onUnauthorized = () => {}
export const getToken = () => token
export const setToken = t => { token = t || ''; t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY) }
/** Chamado quando a API responde 401 (token expirado/inválido), para a tela voltar ao login. */
export const setUnauthorizedHandler = fn => { onUnauthorized = fn }

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
  evidence_required: 'A organização ainda não enviou a comprovação.',
  invalid_review_transition: 'Essa mudança de situação não é permitida.',
  review_unavailable: 'A organização já está verificada ou suspensa.',
  invalid_reason: 'Informe o motivo da decisão (até 1000 caracteres).',
  invalid_food: 'Dados do lote inválidos: confira nome e categoria.',
  invalid_organization: 'Dados da organização inválidos: confira nome e localização.',
  invalid_organization_type: 'Tipo de organização inválido.',
  data_conflict: 'Não foi possível concluir: o registro está em uso (por exemplo, tem alimentos ou requisições ligados a ele).',
  database_unavailable: 'Banco de dados indisponível. Tente novamente em instantes.',
  validation_error: 'Dados inválidos. Confira os campos.',
}
const errorMessage = (body, status) => {
  const e = body?.error
  if (e) return MESSAGES[e.code] || e.message || `Erro ${status}`
  return (Array.isArray(body?.detail) ? body.detail.map(x => x.msg).join('; ') : body?.detail) || `Erro ${status}`
}

// --- HTTP ------------------------------------------------------------------
async function http(method, path, body) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  let r
  if (!BASE) throw new Error('API não configurada: defina VITE_API_URL no arquivo .env do frontend.')
  try {
    r = await fetch((path.startsWith('/health/') ? BASE.replace(/\/api\/v1$/, '') : BASE) + toApiPath(path), { method, headers, body: body && JSON.stringify(toApi(body)) })
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

export const api = { get: p => http('GET', p), post: (p, b) => http('POST', p, b), put: (p, b) => http('PUT', p, b), del: p => http('DELETE', p) }

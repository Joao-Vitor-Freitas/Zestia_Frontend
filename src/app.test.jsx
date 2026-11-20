// Contrato HTTP real (fetch simulado); integridade transacional é testada no backend PostgreSQL.
import { render, screen, within, waitFor, cleanup, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

let calls, role, state, failingLogout
const own = { id: 'own', name: 'Cozinha Exemplo', type: 'COMMUNITY_KITCHEN', location: 'POA', verification_status: 'VERIFIED' }
const donor = { id: 'donor', name: 'Mercado Exemplo', type: 'SUPERMARKET', location: 'POA', verification_status: 'VERIFIED' }
const food = { id: 'food', name: 'Arroz', category: 'Grãos', quantity_kg: '10.000', expiration_date: '2099-01-01', donor_organization_id: 'donor' }
const result = (data, status = 200) => ({ ok: status < 400, status, json: async () => data })
async function setup({ archived = false, pending = false } = {}) {
  cleanup(); localStorage.clear(); vi.resetModules(); vi.stubEnv('VITE_API_URL', 'https://api.example.test/api/v1')
  calls = []; role = 'USER'; failingLogout = false
  state = { own: archived ? null : { ...own, verification_status: pending ? 'PENDING' : 'VERIFIED' }, reqs: [], foods: [{ ...food }] }
  vi.stubGlobal('fetch', vi.fn(async (url, options = {}) => {
    const parsed = new URL(url), path = parsed.pathname.replace('/api/v1', ''), method = options.method || 'GET'
    const body = options.body ? JSON.parse(options.body) : null
    calls.push({ path, method, body, headers: options.headers })
    if (path === '/auth/login') { role = body.email.startsWith('admin') ? 'ADMIN' : 'USER'; return result({ access_token: 'synthetic-session', token_type: 'bearer', expires_in: 900 }) }
    if (path === '/auth/register') return result({ id: 'account', role: 'USER' }, 201)
    if (path === '/auth/me' && method === 'GET') return result({ id: 'account', email: 'member@example.test', role })
    if (path === '/auth/me' && method === 'DELETE') return result(null, 204)
    if (path === '/auth/logout') return failingLogout ? result({ error: { message: 'offline' } }, 503) : result(null, 204)
    if (path === '/auth/me/organization') return state.own ? result(state.own) : result({ error: { code: 'organization_not_found' } }, 404)
    if (path === '/auth/me/organizations/archived') return result(archived ? [own] : [])
    if (path === '/organizations/own/restore') { state.own = { ...own }; return result(own) }
    if (path === '/organizations/own/verification' && method === 'POST') return result(state.own)
    if (path === '/organizations' && method === 'GET') return result([...(state.own ? [state.own] : []), donor])
    if (path === '/organizations/own' && method === 'GET') return result(state.own)
    if (path === '/organizations/own' && method === 'PUT') { state.own = { ...state.own, ...body }; return result(state.own) }
    if (path === '/foods' && method === 'GET') return result(state.foods)
    if (path.endsWith('/availability')) return result({ available_kg: '3.000', has_requests: true })
    if (path === '/requests' && method === 'GET') return result(state.reqs)
    if (path === '/requests' && method === 'POST') {
      state.reqs.push({ id: 'request', food_id: body.food_id, quantity_kg: body.quantity_kg, donor_organization_id: 'donor', recipient_organization_id: 'own', status: 'PENDING', created_at: new Date().toISOString() })
      return result(state.reqs[0], 201)
    }
    if (path === '/metrics') return result({ total_organizations: 2, registered_food_kg: '10.000', requests: { total_requests: state.reqs.length, requested_food_kg: '2.000', approved_food_kg: '0.000', pending_requests: state.reqs.length, approved_requests: 0, rejected_requests: 0 } })
    if (path === '/metrics/organizations') return result([{ organization_id: 'own', organization_name: 'Cozinha Exemplo', registered_food_kg: '0', donation_requests: { approved_food_kg: '0' }, recipient_requests: { approved_food_kg: '0' } }])
    if (path === '/auth/recovery/request') return result({ error: { message: 'Recovery unavailable' } }, 503)
    if (path === '/auth/recovery/confirm') return result(null, 204)
    return result({ error: { message: `Unexpected: ${method} ${path}` } }, 404)
  }))
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  vi.spyOn(window, 'confirm').mockReturnValue(true)
  const { AppProvider } = await import('./context'); const { default: App } = await import('./App')
  render(<AppProvider><App /></AppProvider>)
  const user = userEvent.setup()
  await screen.findByRole('heading', { name: 'Boas-vindas de volta' })
  return user
}
async function login(user) {
  await user.type(screen.getByLabelText('E-mail'), 'member@example.test')
  await user.type(screen.getByLabelText('Senha'), 'test-password-at-least-12')
  await user.click(screen.getByLabelText('Senha').closest('form').querySelector('button[type="submit"]'))
}
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.unstubAllEnvs() })

it('login usa Bearer, mostra saldo do servidor, valida pedido, envia uma só vez e mostra histórico', async () => {
  const user = await setup(); await login(user)
  await user.click(await screen.findByRole('button', { name: /Requisitar lote de Arroz/ }))
  const dialog = screen.getByRole('dialog'), quantity = within(dialog).getByRole('spinbutton')
  expect(dialog.contains(document.activeElement)).toBe(true)
  await user.type(quantity, '4'); await user.click(within(dialog).getByRole('button', { name: 'Enviar requisição' }))
  expect(await within(dialog).findByText(/Máximo disponível: 3 kg/)).toBeTruthy()
  await user.clear(quantity); await user.type(quantity, '2')
  const button = within(dialog).getByRole('button', { name: 'Enviar requisição' }); fireEvent.click(button); fireEvent.click(button)
  await screen.findByText('Requisição enviada!')
  expect(calls.filter(x => x.path === '/requests' && x.method === 'POST')).toHaveLength(1)
  expect(calls.find(x => x.path === '/requests' && x.method === 'POST').body).toEqual({ food_id: 'food', quantity_kg: 2 })
  expect(calls.find(x => x.path === '/foods').headers.Authorization).toBe('Bearer synthetic-session')
  await user.click(screen.getByRole('button', { name: 'Minhas requisições' }))
  expect(await screen.findByText('Aguardando aprovação')).toBeTruthy()
})

it('nova doação mantém validação de validade passada e foco no erro', async () => {
  const user = await setup(); await login(user)
  await user.click(await screen.findByRole('button', { name: 'Nova doação' }))
  await user.type(screen.getByLabelText('O que está doando?'), 'Leite')
  await user.selectOptions(screen.getByLabelText('Categoria'), 'Laticínios')
  await user.type(screen.getByLabelText(/Quantidade/), '5')
  fireEvent.change(screen.getByLabelText('Validade'), { target: { value: '2020-01-01' } })
  await user.click(within(screen.getByRole('form', { name: 'Dados da doação' })).getByRole('button', { name: 'Publicar doação' }))
  expect(await screen.findByText('A validade não pode estar no passado.')).toBeTruthy()
  await waitFor(() => expect(document.activeElement).toBe(screen.getByLabelText('Validade')))
})

it('organização só permite editar a própria, consulta detalhe e envia PUT sem campos extras', async () => {
  const user = await setup(); await login(user)
  await user.click(await screen.findByRole('button', { name: 'Organizações' }))
  expect(screen.queryByRole('button', { name: 'Editar Mercado Exemplo' })).toBeNull()
  await user.click(await screen.findByRole('button', { name: 'Editar Cozinha Exemplo' }))
  const dialog = await screen.findByRole('dialog')
  await user.clear(within(dialog).getByLabelText('Nome')); await user.click(within(dialog).getByRole('button', { name: 'Salvar' }))
  expect(within(dialog).getByText('Informe o nome.')).toBeTruthy()
  await user.type(within(dialog).getByLabelText('Nome'), 'Cozinha Atualizada')
  await user.click(within(dialog).getByRole('button', { name: 'Salvar' }))
  await screen.findByText('Organização salva.')
  expect(calls.find(x => x.method === 'PUT').body).toEqual({ name: 'Cozinha Atualizada', type: 'COMMUNITY_KITCHEN', location: 'POA' })
})

it('painel consulta resumo e detalhamento, converte filtros e move foco ao título', async () => {
  const user = await setup(); await login(user)
  await user.click(await screen.findByRole('button', { name: 'Painel' }))
  await screen.findByRole('heading', { name: 'Por organização' })
  expect(calls.some(x => x.path === '/metrics/organizations')).toBe(true)
  await waitFor(() => expect(document.activeElement.tagName).toBe('H1'))
  await user.selectOptions(screen.getByLabelText('Organização'), 'own')
  expect(await screen.findByText('Alimento registrado (kg)')).toBeTruthy()
})

it('falha no logout preserva a sessão até revogação confirmada', async () => {
  const user = await setup(); await login(user)
  failingLogout = true
  await user.click(await screen.findByRole('button', { name: 'Sair' }))
  await screen.findByText(/Não foi possível encerrar a sessão/)
  expect(localStorage.getItem('token')).toBe('synthetic-session')
  failingLogout = false; await user.click(screen.getByRole('button', { name: 'Sair' }))
  await screen.findByRole('heading', { name: 'Boas-vindas de volta' })
  expect(localStorage.getItem('token')).toBeNull()
})

it('recuperação exibe indisponibilidade e confirma token sem fingir envio de e-mail', async () => {
  const user = await setup()
  await user.click(screen.getByRole('button', { name: 'Recuperar conta' }))
  await user.type(screen.getByLabelText('E-mail'), 'closed@example.test')
  await user.click(screen.getByRole('button', { name: 'Solicitar recuperação' }))
  expect(await screen.findByText(/Recuperação indisponível/)).toBeTruthy()
  await user.type(screen.getByLabelText('Código recebido por e-mail'), 'synthetic-recovery-code')
  await user.click(screen.getByRole('button', { name: 'Confirmar recuperação' }))
  expect(await screen.findByText('Conta restaurada. Faça um novo login.')).toBeTruthy()
})

it('usuário sem organização pode restaurar a arquivada sem precisar criar outra', async () => {
  const user = await setup({ archived: true }); await login(user)
  await user.click(await screen.findByText('Restaurar organização ou gerenciar conta'))
  await user.click(await screen.findByRole('button', { name: 'Restaurar' }))
  await screen.findByRole('heading', { name: 'Oportunidades de doação' })
  expect(calls.some(x => x.path === '/organizations/own/restore')).toBe(true)
})

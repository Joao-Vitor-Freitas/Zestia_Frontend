// Testes de interface: fluxos principais do MVP (backlog, seção 10).
import { render, screen, within, waitFor, cleanup, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

let errs
const setup = async () => {
  localStorage.clear(); vi.resetModules()
  const { AppProvider } = await import('./context'); const App = (await import('./App')).default
  errs = vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.spyOn(window, 'confirm').mockReturnValue(true)
  const user = userEvent.setup()
  render(<AppProvider><App /></AppProvider>)
  expect(screen.queryByLabelText(/Atuando como/)).toBeNull()
  await screen.findByText(/Modo demonstração/)
  const sel = await screen.findByLabelText(/Atuando como/)
  const as = async n => { await user.selectOptions(sel, await within(sel).findByRole('option', { name: new RegExp(n) })); await waitFor(() => expect(sel.selectedOptions[0].textContent).toMatch(new RegExp(n))) }
  const go = n => user.click(screen.getAllByRole('button', { name: n })[0])
  return { user, as, go }
}
afterEach(() => { cleanup(); vi.restoreAllMocks() })

it('solicitar, aprovar e ver no painel; excluir alimento com pedido fica desabilitado', async () => {
  const { user, as, go } = await setup()
  await as('Cozinha')
  await user.click(await screen.findByRole('button', { name: /Solicitar doação de Tomates/ }))
  const dlg = await screen.findByRole('dialog')
  expect(dlg.contains(document.activeElement)).toBe(true)
  const qty = within(dlg).getByRole('spinbutton'), send = () => user.click(within(dlg).getByRole('button', { name: /Enviar/ }))
  await user.type(qty, '99'); await send()
  expect(await within(dlg).findByText(/Máximo disponível: 35/)).toBeTruthy()
  await user.clear(qty); await user.type(qty, '10'); await send()
  expect(await screen.findByText('Solicitação enviada!')).toBeTruthy()
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  await waitFor(() => expect(document.activeElement.getAttribute('aria-label')).toMatch(/Solicitar doação de Tomates/))
  await go('Solicitações'); await user.click(await screen.findByRole('button', { name: 'Enviadas' }))
  expect(await screen.findByText('Pendente')).toBeTruthy()
  await as('Zaffari'); await go('Solicitações')
  await user.click(await screen.findByRole('button', { name: /Aprovar 10 kg/ }))
  expect(await screen.findByText('Solicitação aprovada.')).toBeTruthy()
  await go('Painel')
  const lbl = await screen.findByText('Alimento aprovado (kg)'); await waitFor(() => expect(lbl.previousSibling.textContent).toBe('10'))
  await go('Meus alimentos')
  expect((await screen.findByRole('button', { name: 'Excluir Tomates, cenouras e abobrinhas' })).disabled).toBe(true)
  expect(errs.mock.calls.filter(c => /Warning/.test(String(c[0])))).toEqual([])
})

it('cadastro de alimento: validade passada é barrada', async () => {
  const { user, go } = await setup()
  await go('Meus alimentos'); await user.click(await screen.findByRole('button', { name: 'Cadastrar doação' }))
  const dlg = await screen.findByRole('dialog')
  await user.type(within(dlg).getByLabelText('Nome'), 'Leite'); await user.type(within(dlg).getByLabelText('Categoria'), 'Laticínios')
  await user.type(within(dlg).getByLabelText(/Quantidade/), '5'); fireEvent.change(within(dlg).getByLabelText('Validade'), { target: { value: '2020-01-01' } })
  await user.click(within(dlg).getByRole('button', { name: 'Salvar' }))
  expect(await within(dlg).findByText('A validade não pode estar no passado.')).toBeTruthy()
})

it('organizações: valida, cria, bloqueia exclusão; Esc fecha o modal; filtro do painel', async () => {
  const { user, go } = await setup()
  await go('Organizações'); await user.click(await screen.findByRole('button', { name: 'Nova organização' }))
  const dlg = await screen.findByRole('dialog')
  await user.click(within(dlg).getByRole('button', { name: 'Salvar' }))
  expect(within(dlg).getByText('Informe o nome.')).toBeTruthy()
  await user.type(within(dlg).getByLabelText('Nome'), 'ONG Teste'); await user.selectOptions(within(dlg).getByLabelText('Tipo'), 'NGO')
  await user.click(within(dlg).getByRole('button', { name: 'Salvar' }))
  expect(await screen.findByText('ONG Teste')).toBeTruthy()
  await user.click(screen.getByRole('button', { name: 'Excluir ONG Mesa Solidária' }))
  expect(await screen.findByText(/não pode ser excluída/)).toBeTruthy()
  await user.click(screen.getByRole('button', { name: 'Editar ONG Teste' })); await screen.findByRole('dialog')
  await user.keyboard('{Escape}'); await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  await go('Painel'); const f = await screen.findByLabelText('Organização')
  await user.selectOptions(f, within(f).getByRole('option', { name: 'ONG Teste' }))
  const lbl = await screen.findByText('Alimento registrado (kg)'); await waitFor(() => expect(lbl.previousSibling.textContent).toBe('0'))
})

it('troca de tela move o foco ao título; categorias só de ofertas disponíveis', async () => {
  const { go } = await setup()
  await screen.findByText(/Arroz e feijão/)
  expect(screen.getAllByRole('button', { pressed: false }).map(b => b.textContent)).toContain('Grãos')
  await go('Painel'); await waitFor(() => expect(document.activeElement.tagName).toBe('H1'))
})

it('duplo clique: enviar cria só 1 solicitação e aprovar mantém a mensagem de sucesso', async () => {
  const { user, as, go } = await setup()
  await as('Cozinha')
  await user.click(await screen.findByRole('button', { name: /Solicitar doação de Tomates/ }))
  const dlg = await screen.findByRole('dialog'); await user.type(within(dlg).getByRole('spinbutton'), '5')
  const send = within(dlg).getByRole('button', { name: /Enviar/ }); fireEvent.click(send); fireEvent.click(send)
  await screen.findByText('Solicitação enviada!'); await new Promise(r => setTimeout(r, 600))
  await go('Solicitações'); await user.click(await screen.findByRole('button', { name: 'Enviadas' }))
  expect(await screen.findAllByText('Pendente')).toHaveLength(1)
  await as('Zaffari')
  const ap = await screen.findByRole('button', { name: /Aprovar 5 kg/ }); fireEvent.click(ap); fireEvent.click(ap)
  await screen.findByText('Solicitação aprovada.'); await new Promise(r => setTimeout(r, 600))
  expect(document.querySelector('.toast').textContent).toBe('Solicitação aprovada.')
})

it('botão Atualizar traz solicitações feitas por outra organização', async () => {
  const { user, go } = await setup()
  await go('Solicitações'); expect(await screen.findByText('Nenhuma solicitação por aqui.')).toBeTruthy()
  const { mock } = await import('./services/mock'); const [zaf, , coz] = await mock('GET', '/organizations')
  const tom = (await mock('GET', '/foods'))[0]
  localStorage.setItem('orgId', coz.id); await mock('POST', '/requests', { foodId: tom.id, quantityKg: 3 }); localStorage.setItem('orgId', zaf.id)
  await user.click(screen.getByRole('button', { name: 'Atualizar lista' }))
  expect(await screen.findByText('3 kg')).toBeTruthy()
})

it('título da aba por tela, ErrorBoundary e quantidade enviada como número', async () => {
  const { user, go } = await setup()
  await go('Painel'); await waitFor(() => expect(document.title).toMatch(/Painel · Zestia/))
  const { default: ErrorBoundary } = await import('./components/ErrorBoundary')
  const Boom = () => { throw new Error('falha de teste') }
  render(<ErrorBoundary><Boom /></ErrorBoundary>)
  expect(await screen.findByText('Algo deu errado')).toBeTruthy()
  const { api } = await import('./services/api'); const seen = [], orig = api.post
  api.post = (p, b) => { seen.push(typeof b.quantityKg); return orig(p, b) }
  await go('Meus alimentos'); await user.click(await screen.findByRole('button', { name: 'Cadastrar doação' }))
  const dlg = await screen.findByRole('dialog')
  await user.type(within(dlg).getByLabelText('Nome'), 'Leite'); await user.type(within(dlg).getByLabelText('Categoria'), 'Laticínios'); await user.type(within(dlg).getByLabelText(/Quantidade/), '5')
  fireEvent.change(within(dlg).getByLabelText('Validade'), { target: { value: '2030-01-01' } }); await user.click(within(dlg).getByRole('button', { name: 'Salvar' }))
  await screen.findByText('Alimento salvo.'); expect(seen[0]).toBe('number'); api.post = orig
})

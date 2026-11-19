// Testes de interface: fluxos principais do MVP (backlog, seção 10), no layout do guia visual.
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
  expect(screen.queryByLabelText(/Atuando como/)).toBeNull() // seletor só aparece após carregar as organizações
  await screen.findByText(/Modo demonstração/)
  const sel = await screen.findByLabelText(/Atuando como/)
  const as = async n => { await user.selectOptions(sel, await within(sel).findByRole('option', { name: new RegExp(n) })); await waitFor(() => expect(sel.selectedOptions[0].textContent).toMatch(new RegExp(n))) }
  const go = n => user.click(screen.getByRole('button', { name: n }))
  return { user, as, go }
}
afterEach(() => { cleanup(); vi.restoreAllMocks() })

it('requisitar, aprovar e ver no painel; excluir lote com requisição fica desabilitado', async () => {
  const { user, as, go } = await setup()
  await as('Cozinha')
  await user.click(await screen.findByRole('button', { name: /Requisitar lote de Tomates/ }))
  const dlg = await screen.findByRole('dialog')
  expect(dlg.contains(document.activeElement)).toBe(true)
  const qty = within(dlg).getByRole('spinbutton'), send = () => user.click(within(dlg).getByRole('button', { name: /Enviar requisição/ }))
  await user.type(qty, '99'); await send()
  expect(await within(dlg).findByText(/Máximo disponível: 35 kg/)).toBeTruthy()
  await waitFor(() => expect(document.activeElement).toBe(qty)) // foco vai ao campo com erro
  await user.clear(qty); await user.type(qty, '10'); await send()
  expect(await screen.findByText('Requisição enviada!')).toBeTruthy()
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  // o botão vira "Aguardando aprovação" sem perder o foco
  await waitFor(() => expect(document.activeElement.getAttribute('aria-label')).toMatch(/Tomates.*aguardando aprovação/))
  await go('Minhas requisições')
  expect(await screen.findByText('Aguardando aprovação')).toBeTruthy()
  await as('Zaffari')
  await go(/^Aprovações/)
  await user.click(await screen.findByRole('button', { name: /Aprovar 10 kg/ }))
  expect(await screen.findByText('Requisição aprovada para retirada.')).toBeTruthy()
  await go('Painel')
  const lbl = await screen.findByText('Alimento aprovado (kg)'); await waitFor(() => expect(lbl.nextSibling.textContent).toBe('10'))
  await go('Meus lotes')
  expect((await screen.findByRole('button', { name: 'Excluir Tomates, cenouras e abobrinhas' })).disabled).toBe(true)
  expect(errs.mock.calls.filter(c => /Warning/.test(String(c[0])))).toEqual([])
})

it('nova doação: validade passada é barrada', async () => {
  const { user, go } = await setup()
  await go('Nova doação')
  await user.type(await screen.findByLabelText('O que está doando?'), 'Leite'); await user.selectOptions(screen.getByLabelText('Categoria'), 'Laticínios')
  await user.type(screen.getByLabelText(/Quantidade/), '5'); fireEvent.change(screen.getByLabelText('Validade'), { target: { value: '2020-01-01' } })
  await user.click(screen.getByRole('button', { name: 'Publicar doação' }))
  expect(await screen.findByText('A validade não pode estar no passado.')).toBeTruthy()
  await waitFor(() => expect(document.activeElement).toBe(screen.getByLabelText('Validade')))
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
  const lbl = await screen.findByText('Alimento registrado (kg)'); await waitFor(() => expect(lbl.nextSibling.textContent).toBe('0'))
})

it('filtros por origem e categoria; troca de tela move o foco ao título', async () => {
  const { user, as, go } = await setup()
  await as('Cozinha')
  await screen.findByText('Tomates, cenouras e abobrinhas')
  expect(await screen.findByText('Mostrando 3 de 3 lotes')).toBeTruthy()
  expect([...screen.getByLabelText('Categoria').options].map(o => o.textContent)).toContain('Grãos')
  await user.click(screen.getByRole('button', { name: 'De ONGs e cozinhas' }))
  expect(screen.getByRole('button', { name: 'De ONGs e cozinhas' }).getAttribute('aria-pressed')).toBe('true')
  expect(screen.queryByText('Tomates, cenouras e abobrinhas')).toBeNull()
  expect(screen.getByText('Arroz e feijão')).toBeTruthy()
  expect(screen.getByText('Mostrando 1 de 3 lotes')).toBeTruthy()
  await user.selectOptions(screen.getByLabelText('Categoria'), 'Padaria')
  expect(screen.getByText('Nenhum lote corresponde aos filtros escolhidos.')).toBeTruthy()
  await go('Painel'); await waitFor(() => expect(document.activeElement.tagName).toBe('H1'))
})

it('duplo clique: enviar cria só 1 requisição e aprovar mantém a mensagem de sucesso', async () => {
  const { user, as, go } = await setup()
  await as('Cozinha')
  await user.click(await screen.findByRole('button', { name: /Requisitar lote de Tomates/ }))
  const dlg = await screen.findByRole('dialog'); await user.type(within(dlg).getByRole('spinbutton'), '5')
  const send = within(dlg).getByRole('button', { name: /Enviar/ }); fireEvent.click(send); fireEvent.click(send)
  await screen.findByText('Requisição enviada!'); await new Promise(r => setTimeout(r, 600))
  await go('Minhas requisições')
  expect(await screen.findAllByText('Aguardando aprovação')).toHaveLength(1)
  await as('Zaffari'); await go(/^Aprovações/)
  const ap = await screen.findByRole('button', { name: /Aprovar 5 kg/ }); fireEvent.click(ap); fireEvent.click(ap)
  await screen.findByText('Requisição aprovada para retirada.'); await new Promise(r => setTimeout(r, 600))
  expect(document.querySelector('.toast').textContent).toBe('Requisição aprovada para retirada.')
})

it('botão Atualizar traz requisições feitas por outra organização', async () => {
  const { user, go } = await setup()
  await go(/^Aprovações/); expect(await screen.findByText('Nenhuma requisição recebida por aqui.')).toBeTruthy()
  const { mock } = await import('./services/mock'); const [zaf, , coz] = await mock('GET', '/organizations')
  const tom = (await mock('GET', '/foods'))[0]
  localStorage.setItem('orgId', coz.id); await mock('POST', '/requests', { foodId: tom.id, quantityKg: 3 }); localStorage.setItem('orgId', zaf.id)
  await user.click(screen.getByRole('button', { name: 'Atualizar lista' }))
  expect(await screen.findByText('3 kg')).toBeTruthy()
})

it('título da aba por tela, ErrorBoundary e quantidade enviada como número', async () => {
  const { user, go } = await setup()
  await go('Painel'); await waitFor(() => expect(document.title).toMatch(/Painel/))
  const { default: ErrorBoundary } = await import('./components/ErrorBoundary')
  const Boom = () => { throw new Error('falha de teste') }
  render(<ErrorBoundary><Boom /></ErrorBoundary>)
  expect(await screen.findByText('Algo deu errado')).toBeTruthy()
  const { api } = await import('./services/api'); const seen = [], orig = api.post
  api.post = (p, b) => { seen.push(typeof b.quantityKg); return orig(p, b) }
  await go('Nova doação')
  await user.type(await screen.findByLabelText('O que está doando?'), 'Leite'); await user.selectOptions(screen.getByLabelText('Categoria'), 'Laticínios'); await user.type(screen.getByLabelText(/Quantidade/), '5')
  fireEvent.change(screen.getByLabelText('Validade'), { target: { value: '2030-01-01' } }); await user.click(screen.getByRole('button', { name: 'Publicar doação' }))
  await screen.findByText('Doação publicada.'); expect(seen[0]).toBe('number'); api.post = orig
  expect(await screen.findByRole('heading', { level: 1, name: 'Meus lotes' })).toBeTruthy()
})

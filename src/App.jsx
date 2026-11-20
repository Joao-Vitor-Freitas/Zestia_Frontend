import { useEffect, useRef, useState } from 'react'
import { useApp } from './context'
import Sidebar from './components/Sidebar'
import Toast from './components/Toast'
import ErrorBoundary from './components/ErrorBoundary'
import Offers from './pages/Offers'
import MyFoods from './pages/MyFoods'
import Donate from './pages/Donate'
import Approvals from './pages/Approvals'
import MyRequests from './pages/MyRequests'
import Dashboard from './pages/Dashboard'
import Organizations from './pages/Organizations'
import Account from './pages/Account'
import Login from './pages/Login'
import OrgSetup from './pages/OrgSetup'
import Receipt from './pages/Receipt'
import Verification from './pages/Verification'
import VerificationBanner from './components/VerificationBanner'

// A ordem define a navegação. "cta" = botão de destaque (zest); "sec" = grupo Gestão.
// org = exige organização própria; admin = só para a conta administradora.
const ALL_PAGES = {
  offers: { label: 'Explorar doações', icon: 'compass', C: Offers, org: true },
  foods: { label: 'Meus lotes', icon: 'box', C: MyFoods, org: true },
  new: { label: 'Nova doação', icon: 'plus', C: Donate, cta: true, org: true },
  approvals: { label: 'Aprovações', icon: 'check', C: Approvals, org: true },
  sent: { label: 'Minhas requisições', icon: 'clipboard', C: MyRequests, org: true },
  verify: { label: 'Verificação', icon: 'shield', C: Verification, sec: true, admin: true },
  account: { label: 'Minha conta', icon: 'users', C: Account, sec: true },
  dashboard: { label: 'Painel', icon: 'chart', C: Dashboard, sec: true },
  orgs: { label: 'Organizações', icon: 'users', C: Organizations, sec: true },
  receipt: { label: 'Comprovante de retirada', C: Receipt, hidden: true, parent: 'sent', org: true }, // fora do menu
}
const pagesFor = (isAdmin, hasOrg) =>
  Object.fromEntries(Object.entries(ALL_PAGES).filter(([, p]) => (!p.admin || isAdmin) && (!p.org || hasOrg)))

// Porteiro: carregando -> login -> cadastro da organização -> aplicação.
// O administrador pode entrar sem organização (só Verificação, Painel e Organizações).
export default function App() {
  const { account, org, ready } = useApp()
  if (!ready) return <p className="load" role="status">Carregando…</p>
  if (!account) return <><Login /><Toast /></>
  if (!org && account.role !== 'ADMIN') return <><OrgSetup /><Toast /></>
  return <Shell key={`${account.id}-${org?.id || ''}`} />
}

function Shell() {
  const { orgId, org, account } = useApp()
  const pages = pagesFor(account.role === 'ADMIN', !!org)
  const [route, setRoute] = useState({ page: org ? 'offers' : 'verify' })
  const go = (page, param) => setRoute({ page, param })
  const { C } = pages[route.page] || pages[Object.keys(pages)[0]]
  const title = route.page === 'new' && route.param ? 'Editar lote' : (pages[route.page] || ALL_PAGES[route.page]).label
  useEffect(() => { document.title = `${title} · Zestia` }, [title])
  const first = useRef(true)
  useEffect(() => { // ao trocar de tela, leva o foco ao título (leitores de tela anunciam a mudança)
    if (first.current) { first.current = false; return }
    window.scrollTo?.(0, 0)
    const h = document.querySelector('main h1')
    if (h) { h.tabIndex = -1; h.focus() }
  }, [route])
  return (
    <>
      <a className="skip" href="#main">Pular para o conteúdo</a>
      <Sidebar pages={pages} route={route} go={go} />
      <div className="md:pl-64">
        <main id="main" tabIndex={-1} className="page">
          <VerificationBanner />
          <ErrorBoundary key={`${route.page}-${orgId}-${route.param?.id || ''}`}><C go={go} param={route.param} /></ErrorBoundary>
        </main>
      </div>
      <Toast />
    </>
  )
}

import { useEffect, useRef, useState } from 'react'
import { DEMO } from './services/api'
import { useApp } from './context'
import Sidebar from './components/Sidebar'
import Toast from './components/Toast'
import Icon from './components/Icon'
import ErrorBoundary from './components/ErrorBoundary'
import Offers from './pages/Offers'
import MyFoods from './pages/MyFoods'
import Donate from './pages/Donate'
import Approvals from './pages/Approvals'
import MyRequests from './pages/MyRequests'
import Dashboard from './pages/Dashboard'
import Organizations from './pages/Organizations'

// A ordem define a navegação. "cta" = botão de destaque (zest); "sec" = grupo Gestão.
const pages = {
  offers: { label: 'Explorar doações', icon: 'compass', C: Offers },
  foods: { label: 'Meus lotes', icon: 'box', C: MyFoods },
  new: { label: 'Nova doação', icon: 'plus', C: Donate, cta: true },
  approvals: { label: 'Aprovações', icon: 'check', C: Approvals },
  sent: { label: 'Minhas requisições', icon: 'clipboard', C: MyRequests },
  dashboard: { label: 'Painel', icon: 'chart', C: Dashboard, sec: true },
  orgs: { label: 'Organizações', icon: 'users', C: Organizations, sec: true },
}

export default function App() {
  const [route, setRoute] = useState({ page: 'offers' })
  const go = (page, param) => setRoute({ page, param })
  const { org, orgId, ready } = useApp()
  const { C } = pages[route.page]
  const title = route.page === 'new' && route.param ? 'Editar lote' : pages[route.page].label
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
        {DEMO && <p role="note" className="demo"><Icon name="info" size={16} />Modo demonstração: os dados ficam salvos só neste navegador. Defina VITE_API_URL para usar a API real.</p>}
        <main id="main" tabIndex={-1} className="page">
          {!ready ? <p className="load" role="status">Carregando…</p>
            : org || route.page === 'orgs' ? <ErrorBoundary key={`${route.page}-${orgId}-${route.param?.id || ''}`}><C go={go} param={route.param} /></ErrorBoundary>
              : (
                <div className="empty">
                  <h1 className="text-[22px] leading-7 md:text-[22px]">Boas-vindas à Zestia</h1>
                  <p className="mt-2">Cadastre uma organização para começar.</p>
                  <button type="button" className="btn mt-4" onClick={() => go('orgs')}>Ir para Organizações</button>
                </div>
              )}
        </main>
      </div>
      <Toast />
    </>
  )
}

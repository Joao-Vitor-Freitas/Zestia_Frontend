import { useEffect, useRef, useState } from 'react'
import { DEMO } from './services/api'
import { useApp } from './context'
import Header from './components/Header'
import Alert from './components/Alert'
import ErrorBoundary from './components/ErrorBoundary'
import Offers from './pages/Offers'
import MyFoods from './pages/MyFoods'
import Requests from './pages/Requests'
import Dashboard from './pages/Dashboard'
import Organizations from './pages/Organizations'

const pages = { offers: ['Ofertas', Offers], foods: ['Meus alimentos', MyFoods], requests: ['Solicitações', Requests], dashboard: ['Painel', Dashboard], orgs: ['Organizações', Organizations] }

export default function App() {
  const [page, setPage] = useState('offers')
  const { org, orgId, msg, ready } = useApp()
  const Page = pages[page][1]
  useEffect(() => { document.title = `${pages[page][0]} · ReAlimenta` }, [page])
  const first = useRef(true)
  useEffect(() => { // ao trocar de tela, leva o foco ao título (leitores de tela anunciam a mudança)
    if (first.current) { first.current = false; return }
    const h = document.querySelector('main h1')
    if (h) { h.tabIndex = -1; h.focus() }
  }, [page])
  return (
    <>
      <a className="skip" href="#main">Pular para o conteúdo</a>
      <Header pages={pages} page={page} setPage={setPage} />
      {DEMO && <p role="note" className="bg-amber-100 px-4 py-2 text-center text-sm font-semibold text-amber-900">Modo demonstração: os dados ficam salvos só neste navegador. Defina VITE_API_URL para usar a API real.</p>}
      <main id="main" tabIndex={-1}>
        {!ready ? <p className="load" role="status">Carregando…</p> : org || page === 'orgs' ? <ErrorBoundary key={`${page}-${orgId}`}><Page /></ErrorBoundary> : <p className="empty">Cadastre uma organização em “Organizações” para começar.</p>}
      </main>
      <div className="toast">{msg && <Alert type={msg.type}>{msg.text}</Alert>}</div>
    </>
  )
}

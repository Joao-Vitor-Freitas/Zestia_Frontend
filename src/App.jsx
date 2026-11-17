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

const pages = {
  offers: ['Ofertas', Offers],
  foods: ['Meus alimentos', MyFoods],
  requests: ['Solicitações', Requests],
  dashboard: ['Painel', Dashboard],
  orgs: ['Organizações', Organizations],
}

export default function App() {
  const [page, setPage] = useState('offers')
  const [openCreate, setOpenCreate] = useState(false)
  const { org, orgId, msg, ready } = useApp()
  const Page = pages[page][1]

  useEffect(() => {
    document.title = `${pages[page][0]} · Zestia`
  }, [page])

  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const h = document.querySelector('main h1')
    if (h) {
      h.tabIndex = -1
      h.focus()
    }
  }, [page])

  const handleQuickDonate = () => {
    setPage('foods')
    setOpenCreate(true)
  }

  return (
    <div className="min-h-screen bg-canvas md:flex">
      <a className="skip" href="#main">Pular para o conteúdo</a>

      <Header
        pages={pages}
        page={page}
        setPage={setPage}
        onQuickDonate={handleQuickDonate}
      />

      <div className="flex min-w-0 flex-1 flex-col pb-20 md:pb-0">
        {DEMO && (
          <p role="note" className="border-b border-amber-200 bg-[#FEF0C7] px-4 py-2 text-center text-xs font-semibold text-[#874200]">
            Modo demonstração: os dados ficam salvos só neste navegador. Defina VITE_API_URL para usar a API real.
          </p>
        )}

        <main id="main" tabIndex={-1} className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 md:px-8 md:py-8">
          {!ready ? (
            <p className="load" role="status">Carregando…</p>
          ) : org || page === 'orgs' ? (
            <ErrorBoundary key={`${page}-${orgId}`} onResetHome={() => setPage('offers')}>
              <Page
                openCreate={openCreate}
                onConsumeCreate={() => setOpenCreate(false)}
                setPage={setPage}
                onQuickDonate={handleQuickDonate}
              />
            </ErrorBoundary>
          ) : (
            <p className="empty">Cadastre uma organização em “Organizações” para começar.</p>
          )}
        </main>
      </div>

      <div className="toast">{msg && <Alert type={msg.type}>{msg.text}</Alert>}</div>
    </div>
  )
}

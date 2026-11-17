import { useState } from 'react'
import { useApp } from './context'
import Header from './components/Header'
import Alert from './components/Alert'
import Offers from './pages/Offers'
import MyFoods from './pages/MyFoods'
import Requests from './pages/Requests'
import Dashboard from './pages/Dashboard'
import Organizations from './pages/Organizations'

const pages = { offers: ['Ofertas', Offers], foods: ['Meus alimentos', MyFoods], requests: ['Solicitações', Requests], dashboard: ['Painel', Dashboard], orgs: ['Organizações', Organizations] }

export default function App() {
  const [page, setPage] = useState('offers')
  const { org, orgId, msg } = useApp()
  const Page = pages[page][1]
  return (
    <>
      <a className="skip" href="#main">Pular para o conteúdo</a>
      <Header pages={pages} page={page} setPage={setPage} />
      <main id="main" tabIndex={-1}>
        {org || page === 'orgs' ? <Page key={orgId} /> : <p className="empty">Cadastre uma organização em “Organizações” para começar.</p>}
      </main>
      <div className="toast" aria-live="polite">{msg && <Alert type={msg.type}>{msg.text}</Alert>}</div>
    </>
  )
}

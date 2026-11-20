import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { getAll } from './services/data'
import { api, getToken, setToken, setUnauthorizedHandler } from './services/api'
const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)

// Sessão: conta logada (GET /auth/me) e a organização dela (GET /auth/me/organization; 404 = ainda não cadastrou).
export function AppProvider({ children }) {
  const [account, setAccount] = useState(null), [org, setOrg] = useState(null), [ready, setReady] = useState(false)
  const [orgs, setOrgs] = useState([]) // todas as organizações ativas (nomes/tipos para as telas)
  const [msg, setMsg] = useState(null)
  const timer = useRef()
  const notify = (text, type = 'ok') => { clearTimeout(timer.current); setMsg({ text, type }); timer.current = setTimeout(() => setMsg(null), 4000) }

  const clear = () => { setToken(''); setAccount(null); setOrg(null); setOrgs([]) }
  const refreshOrgs = () => getAll('/organizations').then(setOrgs).catch(e => notify(e.message, 'error'))
  const refreshOrg = () => Promise.all([
    api.get('/auth/me/organization').then(setOrg, e => { if (e.status === 404) setOrg(null); else throw e }),
    refreshOrgs(),
  ])
  const loadSession = async () => {
    if (!getToken()) return setReady(true)
    try { setAccount(await api.get('/auth/me')); await refreshOrg() }
    catch (e) { clear(); if (e.status !== 401) { notify(e.message, 'error'); throw e } }
    finally { setReady(true) }
  }
  const login = async (email, password) => {
    const { accessToken } = await api.post('/auth/login', { email, password })
    setToken(accessToken); setReady(false)
    await loadSession()
  }
  const register = async (email, password) => { await api.post('/auth/register', { email, password }); await login(email, password) }
  // A API pede para revogar a sessão no servidor antes de apagar o token local.
  const logout = async () => { try { await api.post('/auth/logout'); clear() } catch (e) { if (e.status === 401) clear(); else notify('Não foi possível encerrar a sessão no servidor. Tente novamente.', 'error') } }

  useEffect(() => {
    setUnauthorizedHandler(() => { clear(); notify('Sua sessão expirou. Entre novamente.', 'error') })
    loadSession().catch(() => {})
  }, [])

  return (
    <Ctx.Provider value={{ clearSession: clear, account, org, orgId: org?.id || '', orgs, refreshOrgs, ready, login, register, logout, refreshOrg, notify, msg }}>
      {children}
    </Ctx.Provider>
  )
}

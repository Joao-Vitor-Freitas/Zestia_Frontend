import { createContext, useContext, useEffect, useRef, useState } from 'react'
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
  const refreshOrgs = () => api.get('/organizations?limit=100').then(setOrgs).catch(e => notify(e.message, 'error'))
  const refreshOrg = () => Promise.all([
    api.get('/auth/me/organization').then(setOrg, e => { if (e.status === 404) setOrg(null); else throw e }),
    refreshOrgs(),
  ])
  const loadSession = async () => {
    if (!getToken()) return setReady(true)
    try { setAccount(await api.get('/auth/me')); await refreshOrg() }
    catch (e) { if (e.status !== 401) notify(e.message, 'error') }
    finally { setReady(true) }
  }
  const login = async (email, password) => {
    const { accessToken } = await api.post('/auth/login', { email, password })
    setToken(accessToken); setReady(false)
    await loadSession()
  }
  const register = async (email, password) => { await api.post('/auth/register', { email, password }); await login(email, password) }
  // A API pede para revogar a sessão no servidor antes de apagar o token local.
  const logout = async () => { try { await api.post('/auth/logout') } catch { /* token já inválido */ } clear() }

  useEffect(() => {
    setUnauthorizedHandler(() => { clear(); notify('Sua sessão expirou. Entre novamente.', 'error') })
    loadSession()
  }, [])

  return (
    <Ctx.Provider value={{ account, org, orgId: org?.id || '', orgs, refreshOrgs, ready, login, register, logout, refreshOrg, notify, msg }}>
      {children}
    </Ctx.Provider>
  )
}

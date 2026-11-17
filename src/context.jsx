import { createContext, useContext, useEffect, useState } from 'react'
import { api, setOrg } from './services/api'
const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)

export function AppProvider({ children }) {
  const [orgs, setOrgs] = useState([])
  const [orgId, setId] = useState(localStorage.getItem('orgId') || '')
  const [msg, setMsg] = useState(null)
  const notify = (text, type = 'ok') => { setMsg({ text, type }); setTimeout(() => setMsg(null), 4000) }
  const choose = id => { setOrg(id); localStorage.setItem('orgId', id); setId(id) }
  const refreshOrgs = () => api.get('/organizations').then(o => {
    setOrgs(o)
    if (!o.some(x => x.id === localStorage.getItem('orgId'))) choose(o[0]?.id || '')
  }).catch(e => notify(e.message, 'error'))
  useEffect(() => { setOrg(orgId); refreshOrgs() }, [])
  return <Ctx.Provider value={{ orgs, orgId, org: orgs.find(o => o.id === orgId), choose, refreshOrgs, notify, msg }}>{children}</Ctx.Provider>
}

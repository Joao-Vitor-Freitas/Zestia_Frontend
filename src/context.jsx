import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { api, setOrg } from './services/api'

const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)

export function AppProvider({ children }) {
  const [orgs, setOrgs] = useState([])
  const [ready, setReady] = useState(false)
  const [orgId, setId] = useState(localStorage.getItem('orgId') || '')
  const [msg, setMsg] = useState(null)
  const [pendingCount, setPendingCount] = useState(0)
  const timer = useRef()

  const notify = (text, type = 'ok') => {
    clearTimeout(timer.current)
    setMsg({ text, type })
    timer.current = setTimeout(() => setMsg(null), 4000)
  }

  const refreshPending = (targetOrgId = localStorage.getItem('orgId')) => {
    if (!targetOrgId) return setPendingCount(0)
    api
      .get('/requests')
      .then(reqs => {
        const count = (reqs || []).filter(
          r => r.donorOrganizationId === targetOrgId && r.status === 'PENDING'
        ).length
        setPendingCount(count)
      })
      .catch(() => {})
  }

  const choose = id => {
    setOrg(id)
    localStorage.setItem('orgId', id)
    setId(id)
    refreshPending(id)
  }

  const refreshOrgs = () =>
    api
      .get('/organizations')
      .then(o => {
        setOrgs(o)
        const saved = localStorage.getItem('orgId')
        if (!o.some(x => x.id === saved)) {
          choose(o[0]?.id || '')
        } else {
          refreshPending(saved)
        }
      })
      .catch(e => notify(e.message, 'error'))
      .finally(() => setReady(true))

  useEffect(() => {
    setOrg(orgId)
    refreshOrgs()
    return () => clearTimeout(timer.current)
  }, [])

  return (
    <Ctx.Provider
      value={{
        orgs,
        orgId,
        ready,
        org: orgs.find(o => o.id === orgId),
        choose,
        refreshOrgs,
        pendingCount,
        refreshPending,
        notify,
        msg,
      }}
    >
      {children}
    </Ctx.Provider>
  )
}

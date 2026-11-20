import Account from './Account'
import { useEffect, useRef, useState } from 'react'
import { api } from '../services/api'
import { useApp } from '../context'
import { useBusy } from '../hooks/useBusy'
import { TYPES } from '../constants'
import Button from '../components/Button'
import Field, { focusFirstInvalid } from '../components/Field'
import Alert from '../components/Alert'
import Icon from '../components/Icon'

// Primeiro acesso: a conta ainda não tem organização (cada conta pode ter uma só).
export default function OrgSetup() {
  const { account, refreshOrg, logout, notify } = useApp()
  const [form, setForm] = useState({ name: '', type: '', location: '' })
  const [err, setErr] = useState({}), [fail, setFail] = useState('')
  const [busy, run] = useBusy()
  const ref = useRef()
  useEffect(() => { document.title = 'Cadastrar organização · Zestia' }, [])
  const set = k => e => setForm({ ...form, [k]: e.target.value })

  const submit = async e => {
    e.preventDefault()
    const v = {}
    if (!form.name.trim()) v.name = 'Informe o nome.'
    if (!form.type) v.type = 'Escolha o tipo.'
    if (!form.location.trim()) v.location = 'Informe a localização.'
    setErr(v); setFail('')
    if (Object.keys(v).length) return focusFirstInvalid(ref.current)
    await run(async () => {
      try { await api.post('/organizations', form); await refreshOrg(); notify('Organização cadastrada!') }
      catch (x) { setFail(x.message) }
    })
  }

  return (
    <main id="main" className="mx-auto grid min-h-screen max-w-md content-center px-4 py-10">
      <p className="brand mb-6 justify-center md:px-0"><span className="logo"><Icon name="leaf" /></span>zestia</p>
      <div className="card p-6">
        <h1 className="font-display text-[22px] font-bold leading-7">Cadastre sua organização</h1>
        <p className="mt-1 text-muted">Mercados, ONGs e cozinhas comunitárias podem doar e receber. Depois do cadastro, um administrador verifica a organização.</p>
        <form ref={ref} onSubmit={submit} noValidate className="mt-5 grid gap-5">
          {fail && <Alert type="error">{fail}</Alert>}
          <Field label="Nome" autoComplete="organization" required value={form.name} onChange={set('name')} error={err.name} />
          <Field as="select" label="Tipo" required value={form.type} onChange={set('type')} error={err.type}>
            <option value="">Selecione</option>{Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Field>
          <Field label="Localização" placeholder="Bairro ou cidade" required value={form.location} onChange={set('location')} error={err.location} />
          <Button type="submit" disabled={busy}>Cadastrar organização</Button>
        </form>
        <p className="mt-5 text-center text-sm text-muted">
          Conta: {account?.email}. <button type="button" className="link" onClick={logout}>Sair</button>
        </p>
      </div>
      <details className="mt-6"><summary className="cursor-pointer font-semibold">Restaurar organização ou gerenciar conta</summary><Account /></details>
    </main>
  )
}

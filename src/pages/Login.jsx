import { useEffect, useRef, useState } from 'react'
import { useApp } from '../context'
import { useBusy } from '../hooks/useBusy'
import Button from '../components/Button'
import Field, { focusFirstInvalid } from '../components/Field'
import Alert from '../components/Alert'
import Icon from '../components/Icon'

// Tela de entrada: "Entrar" (POST /auth/login) e "Criar conta" (POST /auth/register + login automático).
export default function Login() {
  const { login, register } = useApp()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', confirm: '' })
  const [err, setErr] = useState({}), [fail, setFail] = useState('')
  const [busy, run] = useBusy()
  const ref = useRef()
  const signup = mode === 'register'
  const title = signup ? 'Criar conta' : 'Entrar'
  useEffect(() => { document.title = `${title} · Zestia` }, [title])
  const set = k => e => setForm({ ...form, [k]: e.target.value })
  const switchTo = m => { setMode(m); setErr({}); setFail('') }

  const submit = async e => {
    e.preventDefault()
    const v = {}
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) v.email = 'Informe um e-mail válido.'
    if (signup ? form.password.length < 8 || form.password.length > 128 : !form.password) v.password = signup ? 'A senha deve ter de 8 a 128 caracteres.' : 'Informe a senha.'
    if (signup && form.confirm !== form.password) v.confirm = 'As senhas não conferem.'
    setErr(v); setFail('')
    if (Object.keys(v).length) return focusFirstInvalid(ref.current)
    await run(async () => {
      try { await (signup ? register : login)(form.email.trim(), form.password) }
      catch (x) { setFail(x.message) }
    })
  }

  return (
    <main id="main" className="mx-auto grid min-h-screen max-w-md content-center px-4 py-10">
      <p className="brand mb-6 justify-center md:px-0"><span className="logo"><Icon name="leaf" /></span>zestia</p>
      <div className="card p-6">
        <h1 className="font-display text-[22px] font-bold leading-7">{signup ? 'Crie sua conta' : 'Boas-vindas de volta'}</h1>
        <p className="mt-1 text-muted">{signup ? 'Depois você cadastra a sua organização.' : 'Entre para doar e receber alimentos.'}</p>
        <div className="mt-5 flex gap-2" role="group" aria-label="Escolha uma opção">
          <button type="button" className="chip" aria-pressed={!signup} onClick={() => switchTo('login')}>Entrar</button>
          <button type="button" className="chip" aria-pressed={signup} onClick={() => switchTo('register')}>Criar conta</button>
        </div>
        <form ref={ref} onSubmit={submit} noValidate className="mt-5 grid gap-5">
          {fail && <Alert type="error">{fail}</Alert>}
          <Field label="E-mail" type="email" autoComplete="email" required value={form.email} onChange={set('email')} error={err.email} />
          <Field label="Senha" type="password" autoComplete={signup ? 'new-password' : 'current-password'} required
            hint={signup ? 'De 8 a 128 caracteres.' : undefined} value={form.password} onChange={set('password')} error={err.password} />
          {signup && <Field label="Confirmar senha" type="password" autoComplete="new-password" required value={form.confirm} onChange={set('confirm')} error={err.confirm} />}
          <Button type="submit" disabled={busy}>{busy ? 'Aguarde…' : title}</Button>
        </form>
      </div>
    </main>
  )
}

import { api } from '../services/api'
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
  const recovery = mode === 'recovery'
  const [recoveryToken, setRecoveryToken] = useState(''), [success, setSuccess] = useState('')
  const title = recovery ? 'Recuperar conta encerrada' : signup ? 'Criar conta' : 'Entrar'
  useEffect(() => { document.title = `${title} · Zestia` }, [title])
  const set = k => e => setForm({ ...form, [k]: e.target.value })
  const switchTo = m => { setMode(m); setErr({}); setFail('') }

  const submit = async e => {
    e.preventDefault()
    const v = {}
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) v.email = 'Informe um e-mail válido.'
    if (!recovery && (signup ? form.password.length < 8 || form.password.length > 128 : !form.password)) v.password = signup ? 'A senha deve ter de 8 a 128 caracteres.' : 'Informe a senha.'
    if (signup && form.confirm !== form.password) v.confirm = 'As senhas não conferem.'
    setErr(v); setFail('')
    if (Object.keys(v).length) return focusFirstInvalid(ref.current)
    await run(async () => {
      try {
        setSuccess('')
        if (recovery) {
          if (recoveryToken.trim()) { await api.post('/auth/recovery/confirm', { token: recoveryToken.trim() }); setRecoveryToken(''); switchTo('login'); setSuccess('Conta restaurada. Faça um novo login.') }
          else { await api.post('/auth/recovery/request', { email: form.email.trim() }); setSuccess('Se a conta for elegível, as instruções serão enviadas por e-mail.') }
        } else await (signup ? register : login)(form.email.trim(), form.password)
      }
      catch (x) { setFail(recovery && x.status === 503 ? 'Recuperação indisponível no momento. Tente novamente mais tarde.' : x.message) }
    })
  }

  return (
    <main id="main" className="mx-auto grid min-h-screen max-w-md content-center px-4 py-10">
      <p className="brand mb-6 justify-center md:px-0"><span className="logo"><Icon name="leaf" /></span>zestia</p>
      <div className="card p-6">
        <h1 className="font-display text-[22px] font-bold leading-7">{recovery ? 'Recuperar conta encerrada' : signup ? 'Crie sua conta' : 'Boas-vindas de volta'}</h1>
        <p className="mt-1 text-muted">{signup ? 'Depois você cadastra a sua organização.' : 'Entre para doar e receber alimentos.'}</p>
        <div className="mt-5 flex gap-2" role="group" aria-label="Escolha uma opção">
          <button type="button" className="chip" aria-pressed={mode === 'login'} onClick={() => switchTo('login')}>Entrar</button>
          <button type="button" className="chip" aria-pressed={signup} onClick={() => switchTo('register')}>Criar conta</button>
          <button type="button" className="chip" aria-pressed={recovery} onClick={() => switchTo('recovery')}>Recuperar conta</button>
        </div>
        <form ref={ref} onSubmit={submit} noValidate className="mt-5 grid gap-5">
          {fail && <Alert type="error">{fail}</Alert>}{success && <Alert>{success}</Alert>}
          <Field label="E-mail" type="email" autoComplete="email" required value={form.email} onChange={set('email')} error={err.email} />
          {!recovery && <Field label="Senha" type="password" autoComplete={signup ? 'new-password' : 'current-password'} required
            hint={signup ? 'De 8 a 128 caracteres.' : undefined} value={form.password} onChange={set('password')} error={err.password} />}
          {signup && <Field label="Confirmar senha" type="password" autoComplete="new-password" required value={form.confirm} onChange={set('confirm')} error={err.confirm} />}
          {recovery && <Field label="Código recebido por e-mail" hint="Se já recebeu o código, cole aqui para confirmar a restauração." value={recoveryToken} onChange={e => setRecoveryToken(e.target.value)} />}
          <Button type="submit" disabled={busy}>{busy ? 'Aguarde…' : recovery ? (recoveryToken.trim() ? 'Confirmar recuperação' : 'Solicitar recuperação') : title}</Button>
        </form>
      </div>
    </main>
  )
}

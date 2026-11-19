import { useState } from 'react'
import { api } from '../services/api'
import { useApp } from '../context'
import { useBusy } from '../hooks/useBusy'
import Button from './Button'
import Field from './Field'
import Modal from './Modal'
import Icon from './Icon'

const MIN = 20, MAX = 1000
// A API não informa se a comprovação já foi enviada; guardamos só um lembrete neste navegador.
const sentKey = id => `evidenceSent:${id}`
const wasSent = id => { try { return !!localStorage.getItem(sentKey(id)) } catch { return false } }

const TEXT = {
  PENDING: ['Sua organização está em verificação.', 'Enquanto isso, você pode explorar a rede, mas ainda não pode publicar doações, requisitar lotes nem aprovar pedidos.'],
  REJECTED: ['A verificação da sua organização foi recusada.', 'Envie uma nova comprovação para o administrador analisar de novo.'],
  SUSPENDED: ['Sua organização está suspensa.', 'Doações e requisições estão bloqueadas. Fale com o administrador da Zestia.'],
}

// Aviso para organizações não verificadas, com o envio da comprovação (POST /organizations/{id}/verification).
export default function VerificationBanner() {
  const { org, refreshOrg, notify } = useApp()
  const [open, setOpen] = useState(false), [text, setText] = useState(''), [err, setErr] = useState('')
  const [sent, setSent] = useState(() => org && wasSent(org.id))
  const [busy, run] = useBusy()
  const status = org?.verificationStatus
  if (!org || !TEXT[status]) return null
  const canSubmit = status === 'PENDING' || status === 'REJECTED'
  const [title, body] = TEXT[status]

  const submit = async e => {
    e.preventDefault()
    const n = text.trim().length
    if (n < MIN || n > MAX) return setErr(`Escreva de ${MIN} a ${MAX} caracteres (agora: ${n}).`)
    await run(async () => {
      try {
        await api.post(`/organizations/${org.id}/verification`, { evidence: text.trim() })
        try { localStorage.setItem(sentKey(org.id), '1') } catch { /* sem armazenamento: só não lembra */ }
        setSent(true); setOpen(false); setText('')
        notify('Comprovação enviada. O administrador vai analisar.')
        await refreshOrg()
      } catch (x) { setErr(x.message) }
    })
  }

  return (
    <>
      <div role="status" className={`mb-6 flex flex-wrap items-start gap-3 rounded-2xl border p-4 ${status === 'PENDING' ? 'border-soon-line bg-soon-bg text-soon-fg' : 'border-urgent-line bg-urgent-bg text-urgent-fg'}`}>
        <Icon name={status === 'PENDING' ? 'clock' : 'alert'} className="mt-0.5 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{title}</p>
          <p className="text-sm">{body}{status === 'PENDING' && sent && ' Sua comprovação já foi enviada e aguarda análise.'}</p>
        </div>
        {canSubmit && (
          <Button variant="sec" onClick={() => { setErr(''); setOpen(true) }}>
            {sent && status === 'PENDING' ? 'Reenviar comprovação' : 'Enviar comprovação'}
          </Button>
        )}
      </div>
      {open && (
        <Modal title="Comprovação da organização" onClose={() => setOpen(false)}>
          <form onSubmit={submit} noValidate className="grid gap-5">
            <Field as="textarea" rows={5} label="Como o administrador pode confirmar sua organização?" required
              hint={`Ex.: CNPJ, estatuto, registro no CMAS ou, para cozinhas informais, quem coordena e onde atende. ${text.trim().length}/${MAX} caracteres.`}
              value={text} onChange={e => setText(e.target.value)} error={err} maxLength={MAX} />
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button variant="sec" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={busy}>Enviar para análise</Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}

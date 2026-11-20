import { useState } from 'react'
import { api } from '../services/api'
import { useApp } from '../context'
import { getAll } from '../services/data'
import { useAsync } from '../hooks/useAsync'
import Field from '../components/Field'
import Button from '../components/Button'
import PageHeader from '../components/PageHeader'
import AsyncView from '../components/AsyncView'

export default function Account() {
  const { account, org, refreshOrg: refreshOrgs, notify, clearSession } = useApp()
  const [busy, setBusy] = useState(false), [evidence, setEvidence] = useState('')
  const { data, loading, error, reload } = useAsync(() => getAll('/auth/me/organizations/archived'), [])
  const run = async fn => { setBusy(true); try { await fn() } catch (e) { notify(e.message, 'error') } finally { setBusy(false) } }
  return <>
    <PageHeader title="Minha conta" sub={account.email} />
    <div className="grid gap-6">
      <section className="card"><h2 className="mb-3 text-xl">Conexão</h2><Button disabled={busy} onClick={() => run(async () => { await api.get('/health/live'); await api.get('/health/ready'); notify('API e banco de dados disponíveis.') })}>Verificar conexão</Button></section>
      {org && ['PENDING', 'REJECTED'].includes(org.verificationStatus) && <section className="card"><h2 className="mb-3 text-xl">Verificação da organização</h2><p className="mb-4">{org.name} — {org.verificationStatus}. A participação requer verificação por um administrador.</p>
        <form className="grid gap-4" onSubmit={e => { e.preventDefault(); run(async () => { await api.post(`/organizations/${org.id}/verification`, { evidence }); notify('Evidência enviada para revisão.'); setEvidence(''); await refreshOrgs() }) }}>
          <Field as="textarea" label="Evidências de legitimidade e representação" hint="Descreva sua relação com a instituição e como verificá-la. Cozinhas informais podem apresentar evidências alternativas. Não inclua senhas." minLength={20} maxLength={1000} required value={evidence} onChange={e => setEvidence(e.target.value)} />
          <Button type="submit" disabled={busy}>Enviar evidência</Button>
        </form></section>}
      <section className="card"><h2 className="mb-4 text-xl">Organizações arquivadas</h2><AsyncView data={data} loading={loading} error={error} onRetry={reload} empty={!data?.length} emptyText="Nenhuma organização arquivada.">
        <ul>{data?.map(o => <li className="my-3 flex flex-wrap items-center justify-between gap-3" key={o.id}><span>{o.name}</span><Button disabled={busy || !!org} onClick={() => run(async () => { await api.post(`/organizations/${o.id}/restore`); await refreshOrgs(); reload(); notify('Organização restaurada.') })}>Restaurar</Button></li>)}</ul>
      </AsyncView>{org && <p className="mt-3 hint">Para restaurar outra organização, não pode existir uma organização ativa.</p>}</section>
      <section className="card"><h2 className="mb-3 text-xl">Encerrar conta</h2><p className="mb-3">A operação preserva o histórico e pode ser bloqueada quando houver alimentos ou pedidos vinculados.</p><Button variant="del" disabled={busy} onClick={() => { if (confirm('Encerrar sua conta e sair?')) run(async () => { await api.del('/auth/me'); clearSession() }) }}>Encerrar minha conta</Button></section>
    </div>
  </>
}

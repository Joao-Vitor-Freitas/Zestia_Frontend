// Formatação e regras de exibição compartilhadas pelas telas.
export const fmtKg = n => `${Number(n || 0).toLocaleString('pt-BR', { maximumFractionDigits: 3 })} kg`
export const fmtDate = d => new Date(d.length === 10 ? d + 'T12:00' : d).toLocaleDateString('pt-BR')
export const byNewest = (a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')

export const timeAgo = iso => {
  const m = Math.round((Date.now() - new Date(iso)) / 6e4)
  if (m < 1) return 'agora'
  if (m < 60) return `há ${m} min`
  const h = Math.round(m / 60)
  if (h < 24) return `há ${h} h`
  const d = Math.round(h / 24)
  return d === 1 ? 'há 1 dia' : `há ${d} dias`
}

export const initials = (s = '') => s.split(/\s+/).filter(w => w && !/^(d[aeo]s?|e)$/i.test(w)).slice(0, 2).map(w => w[0]).join('').toUpperCase()

// Selo de validade (guia visual): urgent < 24h, soon 24h–72h, ok > 72h. Conta até o fim do dia da validade.
export const expiry = date => {
  const h = (new Date(date + 'T23:59:59') - Date.now()) / 36e5
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const days = Math.round((new Date(date + 'T00:00:00') - today) / 864e5)
  const level = h < 24 ? 'urgent' : h <= 72 ? 'soon' : 'ok'
  const text = h <= 0 ? 'Vencido' : days <= 0 ? 'Vence hoje' : days === 1 ? 'Vence amanhã' : `Vence em ${days} dias`
  return { h, days, level, text, expired: h <= 0 }
}

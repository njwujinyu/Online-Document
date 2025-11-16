/*
版权声明 (c) 2025 作者：Edi。保留所有权利。
所有讨论与反馈请使用本仓库 Issues。
*/
const base = ((import.meta as unknown) as { env?: { VITE_WORKER_BASE_URL?: string } }).env?.VITE_WORKER_BASE_URL || '/api'

export async function getDocs() {
  if (!base) return []
  const r = await fetch(`${base}/docs`)
  if (!r.ok) return []
  return r.json()
}

export async function getDoc(path: string) {
  if (!base) return { path, content: '' }
  const r = await fetch(`${base}/doc/${encodeURIComponent(path)}`)
  if (!r.ok) {
    const ct = r.headers.get('content-type') || ''
    if (ct.includes('application/json')) {
      const d = await r.json().catch(() => ({})) as { error?: string }
      return { path, content: '', error: d.error || 'DOC_NOT_FOUND' }
    }
    const t = await r.text().catch(() => '')
    return { path, content: '', error: t || 'DOC_NOT_FOUND' }
  }
  return r.json()
}

export async function triggerSync(): Promise<{ ok: boolean, error?: string }> {
  if (!base) return { ok: false, error: 'NO_BASE_URL' }
  const r = await fetch(`${base}/sync`, { credentials: 'include' })
  if (r.ok) return { ok: true }
  const ct = r.headers.get('content-type') || ''
  if (ct.includes('application/json')) {
    const data = await r.json().catch(() => ({})) as { error?: string }
    return { ok: false, error: data.error || 'SYNC_FAILED' }
  }
  const text = await r.text().catch(() => '')
  return { ok: false, error: text || 'SYNC_FAILED' }
}

export async function postLogin(username: string, password: string) {
  if (!base) return { ok: false }
  const r = await fetch(`${base}/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username, password }),
    credentials: 'include'
  })
  return { ok: r.ok }
}

export async function getSession() {
  if (!base) return { authenticated: false }
  const r = await fetch(`${base}/session`, { credentials: 'include' })
  if (!r.ok) return { authenticated: false }
  return r.json()
}

export async function postLogout() {
  if (!base) return { ok: false }
  const r = await fetch(`${base}/logout`, { method: 'POST', credentials: 'include' })
  return { ok: r.ok }
}

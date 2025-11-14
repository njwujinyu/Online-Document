/*
版权声明 (c) 2025 Edi. 保留所有权利。
所有讨论与反馈请使用本仓库 Issues。
*/
const base = ((import.meta as unknown) as { env?: { VITE_WORKER_BASE_URL?: string } }).env?.VITE_WORKER_BASE_URL || ''

export async function getDocs() {
  if (!base) return []
  const r = await fetch(`${base}/docs`)
  if (!r.ok) return []
  return r.json()
}

export async function getDoc(path: string) {
  if (!base) return { path, content: '' }
  const r = await fetch(`${base}/doc/${encodeURIComponent(path)}`)
  if (!r.ok) return { path, content: '' }
  return r.json()
}

export async function triggerSync() {
  if (!base) return false
  const r = await fetch(`${base}/sync`)
  return r.ok
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

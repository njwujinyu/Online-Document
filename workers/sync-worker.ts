/// <reference types="@cloudflare/workers-types" />
/*
版权声明 (c) 2025 Edi. 保留所有权利。
所有讨论与反馈请使用本仓库 Issues。
*/
import * as bcrypt from 'bcryptjs'
export interface Env {
  DOCS_CACHE: KVNamespace
  GITHUB_TOKEN: string
  REPO_OWNER: string
  REPO_NAME: string
  DOCS_DIR: string
  BRANCH: string
  ALLOWED_ORIGIN: string
  ADMIN_USERNAME: string
  ADMIN_PASSWORD_HASH: string
  SESSION_SECRET: string
}

const json = (data: unknown, origin: string) => new Response(JSON.stringify(data), {
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': origin || '*',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type',
    'access-control-allow-credentials': 'true'
  }
})

const ok = (text: string, origin: string) => new Response(text, {
  headers: {
    'content-type': 'text/plain; charset=utf-8',
    'access-control-allow-origin': origin || '*',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type',
    'access-control-allow-credentials': 'true'
  }
})

const b64 = (s: string) => atob(s)

async function listDocs(env: Env) {
  const url = `https://api.github.com/repos/${env.REPO_OWNER}/${env.REPO_NAME}/git/trees/${env.BRANCH}?recursive=1`
  const etagKey = 'etag:tree'
  const prevEtag = await env.DOCS_CACHE.get(etagKey)
  const r = await fetch(url, { headers: { 'authorization': `Bearer ${env.GITHUB_TOKEN}`, 'accept': 'application/vnd.github+json', ...(prevEtag ? { 'if-none-match': prevEtag } : {}) } })
  if (r.status === 304) return [] as Array<{ path: string; sha: string }>
  const data = await r.json() as { tree?: Array<{ path?: string; type?: string; sha?: string }> }
  const et = r.headers.get('etag')
  if (et) await env.DOCS_CACHE.put(etagKey, et)
  const items = (data.tree || []).filter((i) => (i.path || '').startsWith(`${env.DOCS_DIR}/`) && i.type === 'blob' && (i.path || '').endsWith('.md'))
  return items.map((i) => ({ path: String(i.path), sha: String(i.sha) }))
}

async function fetchDoc(path: string, env: Env) {
  const url = `https://api.github.com/repos/${env.REPO_OWNER}/${env.REPO_NAME}/contents/${path}?ref=${env.BRANCH}`
  const r = await fetch(url, { headers: { 'authorization': `Bearer ${env.GITHUB_TOKEN}`, 'accept': 'application/vnd.github+json' } })
  const data = await r.json()
  if (!data.content) return ''
  return b64(data.content)
}

async function sync(env: Env) {
  const items = await listDocs(env)
  if (items.length === 0) return
  const index: { path: string; title: string; sha: string; summary?: string; tags?: string[] }[] = []
  for (const it of items) {
    const key = it.path
    const existing = await env.DOCS_CACHE.getWithMetadata<string, { sha?: string, path: string }>(key)
    const currentSha = (existing && existing.metadata?.sha) || ''
    if (it.sha !== currentSha) {
      const md = await fetchDoc(key, env)
      await env.DOCS_CACHE.put(key, md, { metadata: { sha: it.sha, path: key } })
    }
    const content = await env.DOCS_CACHE.get(key)
    const match = content ? content.match(/^#\s+(.+)$/m) : null
    const title = match ? match[1] : key.split('/').pop() || key
    let summary = ''
    let tags: string[] = []
    if (content) {
      if (content.startsWith('---')) {
        const end = content.indexOf('\n---')
        if (end !== -1) {
          const fm = content.slice(3, end).trim()
          const tm = fm.match(/tags:\s*(.+)/i)
          if (tm) {
            tags = tm[1].split(/[\s,]+/).map(s => s.trim()).filter(Boolean)
          }
        }
      }
      const lines = content.split(/\r?\n/)
      for (const line of lines) {
        const t = line.trim()
        if (!t) continue
        if (t.startsWith('#')) continue
        if (t.startsWith('```')) break
        summary = t.slice(0, 140)
        break
      }
    }
    index.push({ path: key, title, sha: it.sha, summary, tags })
  }
  await env.DOCS_CACHE.put('index', JSON.stringify(index))
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const originHeader = req.headers.get('origin') || ''
    const origin = originHeader || env.ALLOWED_ORIGIN || '*'
    if (req.method === 'OPTIONS') return ok('', origin)
    const u = new URL(req.url)
    if (u.pathname === '/login' && req.method === 'POST') {
      return await login(req, env)
    }
    if (u.pathname === '/session') {
      return await session(req, env)
    }
    if (u.pathname === '/logout') {
      return await logout(req, env)
    }
    if (u.pathname === '/sync') {
      await sync(env)
      return ok('ok', origin)
    }
    if (u.pathname === '/docs') {
      const data = await env.DOCS_CACHE.get('index')
      return json(data ? JSON.parse(data) : [], origin)
    }
    if (u.pathname.startsWith('/doc/')) {
      const key = u.pathname.replace('/doc/', '')
      const data = await env.DOCS_CACHE.get(key)
      return data ? json({ path: key, content: data }, origin) : new Response('not found', { status: 404 })
    }
    return ok('online-document-sync', origin)
  },
  async scheduled(_event: ScheduledEvent, env: Env): Promise<void> {
    await sync(env)
  }
}
function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function getCookie(req: Request, name: string) {
  const h = req.headers.get('cookie') || ''
  const m = h.match(new RegExp(`${name}=([^;]+)`))
  return m ? decodeURIComponent(m[1]) : ''
}

function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Expires=${expires}`
}

async function login(req: Request, env: Env) {
  const originHeader = req.headers.get('origin') || ''
  const origin = originHeader || env.ALLOWED_ORIGIN || '*'
  const body = await req.json().catch(() => ({})) as { username?: string, password?: string }
  const { username = '', password = '' } = body
  const okPwd = env.ADMIN_PASSWORD_HASH ? bcrypt.compareSync(password, env.ADMIN_PASSWORD_HASH) : false
  if (username === env.ADMIN_USERNAME && okPwd) {
    const id = uid()
    await env.DOCS_CACHE.put(`session:${id}`, JSON.stringify({ username }), { expirationTtl: 7 * 24 * 60 * 60 })
    return new Response(JSON.stringify({ ok: true }), {
      headers: {
        'content-type': 'application/json',
        'access-control-allow-origin': origin,
        'access-control-allow-credentials': 'true',
        'set-cookie': setCookie('session', id, 7)
      }
    })
  }
  return new Response(JSON.stringify({ ok: false }), { status: 401, headers: { 'content-type': 'application/json', 'access-control-allow-origin': origin } })
}

async function session(req: Request, env: Env) {
  const originHeader = req.headers.get('origin') || ''
  const origin = originHeader || env.ALLOWED_ORIGIN || '*'
  const id = getCookie(req, 'session')
  if (!id) return json({ authenticated: false }, origin)
  const s = await env.DOCS_CACHE.get(`session:${id}`)
  return json({ authenticated: !!s }, origin)
}

async function logout(req: Request, env: Env) {
  const originHeader = req.headers.get('origin') || ''
  const origin = originHeader || env.ALLOWED_ORIGIN || '*'
  const id = getCookie(req, 'session')
  if (id) {
    await env.DOCS_CACHE.delete(`session:${id}`)
  }
  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      'content-type': 'application/json',
      'access-control-allow-origin': origin,
      'access-control-allow-credentials': 'true',
      'set-cookie': 'session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
    }
  })
}

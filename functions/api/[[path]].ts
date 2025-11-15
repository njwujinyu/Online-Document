export const onRequest = async ({ request, env }: { request: Request; env: Record<string, string> }) => {
  const base = env.VITE_WORKER_BASE_URL || ''
  if (!base) return new Response('WORKER_URL_NOT_SET', { status: 500 })
  const u = new URL(request.url)
  const sub = u.pathname.replace(/^\/api/, '') || '/'
  const target = base + sub + (u.search || '')
  const headers = new Headers(request.headers)
  const init: RequestInit = {
    method: request.method,
    headers,
    body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
    redirect: 'follow'
  }
  const res = await fetch(target, init)
  const h = new Headers(res.headers)
  return new Response(res.body, { status: res.status, headers: h })
}

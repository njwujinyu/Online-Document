/*
版权声明 (c) 2025 Edi. 保留所有权利。
所有讨论与反馈请使用本仓库 Issues。
*/
import React from 'react'
import { Folder, FileText, RefreshCw } from 'lucide-react'
import { getDocs, getDoc } from '@/utils/api'
import { marked } from 'marked'
import { useLocation } from 'react-router-dom'
import DOMPurify from 'dompurify'
import Prism from 'prismjs'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-json'
import 'prismjs/themes/prism.css'

export default function DocsPage() {
  const [items, setItems] = React.useState<{ path: string; title: string }[]>([])
  const [active, setActive] = React.useState<string>('')
  const [content, setContent] = React.useState<string>('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const location = useLocation()

  const load = React.useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const list = await getDocs()
      const q = new URLSearchParams(location.search).get('q')?.trim().toLowerCase() || ''
      const filtered = q ? list.filter((it: { path: string; title: string; summary?: string; tags?: string[] }) => {
        const qq = q
        const inTitle = it.title.toLowerCase().includes(qq)
        const inPath = it.path.toLowerCase().includes(qq)
        const inSummary = (it.summary || '').toLowerCase().includes(qq)
        const inTags = (it.tags || []).some(t => t.toLowerCase().includes(qq))
        return inTitle || inPath || inSummary || inTags
      }) : list
      setItems(filtered)
      if (filtered.length) {
        const first = filtered[0]
        setActive(first.path)
        const d = await getDoc(first.path)
        marked.setOptions({
          highlight: (code: string, lang: string) => {
            const language = Prism.languages[lang as keyof typeof Prism.languages] || Prism.languages.markup
            return Prism.highlight(code, language, lang || 'markup')
          }
        })
        const html = d.content ? marked.parse(d.content) as string : ''
        const safe = DOMPurify.sanitize(html)
        setContent(safe)
      }
    } catch {
      setError('无法加载文档，请检查 Worker 配置')
    } finally {
      setLoading(false)
    }
  }, [location.search])

  React.useEffect(() => { load() }, [load])

  const openDoc = async (path: string) => {
    setActive(path)
    const d = await getDoc(path)
    const html = d.content ? marked.parse(d.content) as string : ''
    const safe = DOMPurify.sanitize(html)
    setContent(safe)
  }

  return (
    <div className="flex h满">
      <aside className="w-72 border-r border-surface-200 dark:border-surface-700 p-4 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Folder className="w-5 h-5 text-primary-600" />
            <span className="font-semibold">文档库</span>
          </div>
          <button onClick={load} className="p-2 rounded hover:bg-surface-100 dark:hover:bg-surface-700">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <div className="text-xs text-surface-500 dark:text-surface-400">共 {items.length} 条结果</div>
        {error && <div className="text-error-600 text-sm">{error}</div>}
        {items.map(it => (
          <button key={it.path} onClick={() => openDoc(it.path)} className={`w-full flex items-center space-x-2 p-2 rounded ${active === it.path ? 'bg-primary-50 dark:bg-primary-900/20' : 'hover:bg-surface-100 dark:hover:bg-surface-700'}`}>
            <FileText className="w-4 h-4 text-surface-600 dark:text-surface-400" />
            <span className="truncate">{it.title}</span>
          </button>
        ))}
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h高">
            <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <article className="prose prose-slate max-w-none markdown-content" dangerouslySetInnerHTML={{ __html: content }} />
        )}
      </main>
    </div>
  )
}

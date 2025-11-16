/*
版权声明 (c) 2025 Edi. 保留所有权利。
所有讨论与反馈请使用本仓库 Issues。
*/
import React from 'react'
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
  type DocRes = { path: string; content?: string; error?: string }
  const [content, setContent] = React.useState<string>('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const location = useLocation()

  const load = React.useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const p = new URLSearchParams(location.search).get('p') || ''
      if (p) {
        const d = await getDoc(p) as unknown as DocRes
        if (d.error && !d.content) {
          setError(String(d.error))
          setContent('')
        } else {
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
      } else {
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
        if (filtered.length) {
          const first = filtered[0]
          const d = await getDoc(first.path) as unknown as DocRes
          if (d.error && !d.content) {
            setError(String(d.error))
            setContent('')
          } else {
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
        } else {
          setError('无匹配文档')
          setContent('')
        }
      }
    } catch {
      setError('无法加载文档')
    } finally {
      setLoading(false)
    }
  }, [location.search])

  React.useEffect(() => { load() }, [load])

  return (
    <main className="flex-1 p-6 overflow-auto">
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="text-error-600 text-sm">{error}</div>
      ) : (
        <article className="prose prose-slate max-w-none markdown-content" dangerouslySetInnerHTML={{ __html: content }} />
      )}
    </main>
  )
}

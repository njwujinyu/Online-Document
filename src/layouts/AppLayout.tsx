/*
版权声明 (c) 2025 Edi. 保留所有权利。
所有讨论与反馈请使用本仓库 Issues。
*/
import React from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { LogOut, Menu, Folder, FileText, Search, Moon, Sun, ArrowLeft } from 'lucide-react'
import { getDocs } from '@/utils/api'
import { useAuthStore } from '@/stores/authStore'

const AppLayout: React.FC = () => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = React.useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 768 : true))
  const [darkMode, setDarkMode] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [docs, setDocs] = React.useState<Array<{ path: string; title: string; summary?: string; tags?: string[] }>>([])

  React.useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark' || 
      window.matchMedia('(prefers-color-scheme: dark)').matches
    setDarkMode(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  React.useEffect(() => {
    (async () => {
      const list = await getDocs()
      setDocs(Array.isArray(list) ? list : [])
    })()
  }, [])

  const toggleDarkMode = () => {
    const v = !darkMode
    setDarkMode(v)
    document.documentElement.classList.toggle('dark', v)
    localStorage.setItem('theme', v ? 'dark' : 'light')
  }

  const goBack = () => {
    navigate(-1)
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="flex h-screen bg-surface-100 dark:bg-surface-900">
      <div
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }} ${
          sidebarOpen ? 'w-64' : 'w-0 md:w-20'
        } fixed md:static inset-y-0 left-0 z-40 bg-white dark:bg-surface-800 border-r border-surface-200 dark:border-surface-700 transition-all duration-300 flex flex-col overflow-hidden ${sidebarOpen ? '' : 'pointer-events-none md:pointer-events-auto'}`}
      >
        <div className="p-4 border-b border-surface-200 dark:border-surface-700">
          <div className={`flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
            {sidebarOpen && (
              <h1 className="text-xl font-semibold text-surface-900 dark:text-surface-100">文档系统</h1>
            )}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700">
              <Menu className="w-5 h-5 text-surface-600 dark:text-surface-400" />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <div className="flex items-center space-x-3 h-12 px-3 rounded-lg border border-surface-200 dark:border-surface-600 bg-surface-50 dark:bg-surface-700">
            <Search className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            {sidebarOpen && (
              <input
                value={searchQuery}
                onChange={(e) => {
                  const q = e.target.value
                  setSearchQuery(q)
                  navigate(`/docs?q=${encodeURIComponent(q)}`)
                }}
                className="flex-1 h-8 px-2 bg-transparent text-surface-900 dark:text-surface-100 placeholder-surface-500 dark:placeholder-surface-400 focus:outline-none focus:ring-0"
                placeholder="搜索"
              />
            )}
          </div>

          <button onClick={() => navigate('/docs')} className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 text-primary-600 dark:text-primary-400">
            <Folder className="w-5 h-5" />
            {sidebarOpen && <span>文档库</span>}
          </button>

          <div className="space-y-1">
            {docs
              .filter(it => {
                const q = searchQuery.trim().toLowerCase()
                if (!q) return true
                const inTitle = (it.title || '').toLowerCase().includes(q)
                const inPath = (it.path || '').toLowerCase().includes(q)
                const inSummary = (it.summary || '').toLowerCase().includes(q)
                const inTags = (it.tags || []).some(t => t.toLowerCase().includes(q))
                return inTitle || inPath || inSummary || inTags
              })
              .map(it => (
                <button key={it.path} onClick={() => navigate(`/docs?p=${encodeURIComponent(it.path)}`)} className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-400">
                  <FileText className="w-4 h-4" />
                  {sidebarOpen && <span className="truncate">{it.title}</span>}
                </button>
              ))}
          </div>

          <button onClick={() => navigate('/me')} className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-400">
            <FileText className="w-5 h-5" />
            {sidebarOpen && <span>我的文档</span>}
          </button>
        </nav>

        <div className="p-4 border-t border-surface-200 dark:border-surface-700 space-y-4">
          <button onClick={toggleDarkMode} className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-400">
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {sidebarOpen && <span>{darkMode ? '浅色模式' : '深色模式'}</span>}
          </button>
          <button onClick={handleLogout} className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-error-500/10 dark:hover:bg-error-500/10 text-error-600 dark:text-error-500">
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>退出登录</span>}
          </button>
        </div>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <div className="flex-1 flex flex-col">
        <header className="bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700">
                <Menu className="w-5 h-5 text-surface-600 dark:text-surface-400" />
              </button>
              <button onClick={goBack} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700">
                <ArrowLeft className="w-5 h-5 text-surface-600 dark:text-surface-400" />
              </button>
              <div>
                <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                  {location.pathname === '/' ? '仪表盘' : location.pathname === '/docs' ? '文档库' : location.pathname === '/me' ? '我的文档' : '页面'}
                </h2>
                <p className="text-sm text-surface-600 dark:text-surface-400">欢迎回来, {user?.username}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">{user?.username?.charAt(0).toUpperCase()}</span>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout
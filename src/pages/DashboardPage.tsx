/*
版权声明 (c) 2025 Edi. 保留所有权利。
所有讨论与反馈请使用本仓库 Issues。
*/
import React from 'react'
import { LogOut, Menu, Folder, FileText, Search, Moon, Sun } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useNavigate } from 'react-router-dom'
import { triggerSync, getDocs } from '@/utils/api'

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = React.useState(true)
  const [darkMode, setDarkMode] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [syncMsg, setSyncMsg] = React.useState('')
  const [docCount, setDocCount] = React.useState(0)

  React.useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark' || 
      window.matchMedia('(prefers-color-scheme: dark)').matches
    setDarkMode(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  React.useEffect(() => {
    (async () => {
      const list = await getDocs()
      setDocCount(Array.isArray(list) ? list.length : 0)
    })()
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    document.documentElement.classList.toggle('dark', newDarkMode)
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light')
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="flex h-screen bg-surface-100 dark:bg-surface-900">
      {/* Sidebar */}
      <div className={`
        ${sidebarOpen ? 'w-64' : 'w-20'} 
        bg-white dark:bg-surface-800 
        border-r border-surface-200 dark:border-surface-700
        transition-all duration-300
        flex flex-col
      `}>
        {/* Header */}
        <div className="p-4 border-b border-surface-200 dark:border-surface-700">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <h1 className="text-xl font-semibold text-surface-900 dark:text-surface-100">
                文档系统
              </h1>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700"
            >
              <Menu className="w-5 h-5 text-surface-600 dark:text-surface-400" />
            </button>
          </div>
        </div>

        {/* Navigation */}
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
          
          <button onClick={() => navigate('/me')} className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-400">
            <FileText className="w-5 h-5" />
            {sidebarOpen && <span>我的文档</span>}
          </button>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-surface-200 dark:border-surface-700 space-y-4">
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-400"
          >
            {darkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
            {sidebarOpen && <span>{darkMode ? '浅色模式' : '深色模式'}</span>}
          </button>
          
          
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-error-50 dark:hover:bg-error-900/20 text-error-600 dark:text-error-400"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>退出登录</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                欢迎回来, {user?.username}
              </h2>
              <p className="text-sm text-surface-600 dark:text-surface-400">
                私有文档管理系统
              </p>
            </div>
            
            <div className="flex items中心 space-x-4">
              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text白 font-semibold">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-sm p-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-10 h-10 text-primary-600 dark:text-primary-400" />
                </div>
                
                <h3 className="text-2xl font-bold text-surface-900 dark:text-surface-100 mb-4">
                  开始使用文档系统
                </h3>
                
                <p className="text-surface-600 dark:text-surface-400 mb-8">
                  这是一个基于 Github 私有仓库和 Cloudflare 的私有文档管理系统。
                  所有文档都会自动同步并安全存储。
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <button onClick={() => navigate('/docs')} className="text-center p-6 bg-surface-50 dark:bg-surface-700 rounded-xl">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Folder className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h4 className="font-semibold text-surface-900 dark:text-surface-100 mb-2">
                      文档管理
                    </h4>
                    <p className="text-sm text-surface-600 dark:text-surface-400">
                      创建、编辑和组织您的文档
                    </p>
                  </button>

                  <div className="text-center p-6 bg-surface-50 dark:bg-surface-700 rounded-xl">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h4 className="font-semibold text-surface-900 dark:text-surface-100 mb-2">
                      文档概览
                    </h4>
                    <p className="text-sm text-surface-600 dark:text-surface-400">
                      当前索引文档数：{docCount}
                    </p>
                  </div>

                  <button onClick={async () => { setSyncMsg('同步中...'); const ok = await triggerSync(); setSyncMsg(ok ? '同步完成' : '同步失败'); }} className="text-center p-6 bg-surface-50 dark:bg-surface-700 rounded-xl">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Menu className="w-6 h-6 text紫色-600 dark:text紫色-400" />
                    </div>
                    <h4 className="font-semibold text-surface-900 dark:text-surface-100 mb-2">
                      安全同步
                    </h4>
                    <p className="text-sm text-surface-600 dark:text-surface-400">
                      自动同步到 Github 私有仓库
                    </p>
                  </button>
                </div>
                {syncMsg && (
                  <div className="mt-4 text-center text-sm text-surface-600 dark:text-surface-400">{syncMsg}</div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardPage

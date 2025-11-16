/*
版权声明 (c) 2025 作者：Edi。保留所有权利。
所有讨论与反馈请使用本仓库 Issues。
*/
import { Settings, Moon, Sun } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function SettingsPage() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')
    setDark(isDark)
  }, [])

  const toggle = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Settings className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            <h2 className="text-xl font-semibold text-surface-900 dark:text-surface-100">系统设置</h2>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-surface-50 dark:bg-surface-700">
            <div>
              <div className="font-medium text-surface-900 dark:text-surface-100">深色模式</div>
              <div className="text-sm text-surface-600 dark:text-surface-400">切换界面主题为深色或浅色</div>
            </div>
            <button onClick={toggle} className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white flex items-center space-x-2">
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span>{dark ? '浅色模式' : '深色模式'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

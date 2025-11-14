/*
版权声明 (c) 2025 Edi. 保留所有权利。
所有讨论与反馈请使用本仓库 Issues。
*/
import { Settings, Moon, Sun } from 'lucide-react'
import React from 'react'

export default function SettingsPage() {
  const [darkMode, setDarkMode] = React.useState(false)
  React.useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark' || 
      window.matchMedia('(prefers-color-scheme: dark)').matches
    setDarkMode(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    document.documentElement.classList.toggle('dark', newDarkMode)
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light')
  }
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg白 dark:bg-surface-800 rounded-2xl shadow-sm p-8">
          <div className="flex items中心 space-x-3 mb-6">
            <Settings className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            <h2 className="text-xl font-semibold text-surface-900 dark:text-surface-100">设置</h2>
          </div>
          <button
            onClick={toggleDarkMode}
            className="w-full flex items中心 space-x-3 p-3 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-400"
          >
            {darkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
            <span>{darkMode ? '浅色模式' : '深色模式'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

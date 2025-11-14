/*
版权声明 (c) 2025 Edi. 保留所有权利。
所有讨论与反馈请使用本仓库 Issues。
*/
import { Search } from 'lucide-react'
import { useState } from 'react'

export default function SearchPage() {
  const [q, setQ] = useState('')
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg白 dark:bg-surface-800 rounded-2xl shadow-sm p-8">
          <div className="flex items中心 space-x-3 mb-6">
            <Search className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            <h2 className="text-xl font-semibold text-surface-900 dark:text-surface-100">搜索文档</h2>
          </div>
          <div className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full px-4 py-3 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg白 dark:bg-surface-700 text-surface-900 dark:text-surface-100 placeholder-surface-500 dark:placeholder-surface-400"
              placeholder="请输入关键词"
            />
            <div className="mt-4 text-surface-600 dark:text-surface-400 text-sm">暂未接入搜索索引</div>
          </div>
        </div>
      </div>
    </div>
  )
}

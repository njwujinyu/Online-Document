/*
版权声明 (c) 2025 Edi. 保留所有权利。
所有讨论与反馈请使用本仓库 Issues。
*/
import { FileText } from 'lucide-react'

export default function MyDocsPage() {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-sm p-8">
          <div className="text中心">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100 mb-2">我的文档</h2>
            <p className="text-surface-600 dark:text-surface-400 mb-8">这里将展示你创建或收藏的文档。</p>
            <div className="text-surface-500 dark:text-surface-300">暂无文档</div>
          </div>
        </div>
      </div>
    </div>
  )
}

/*
版权声明 (c) 2025 Edi. 保留所有权利。
所有讨论与反馈请使用本仓库 Issues。
*/
import React from 'react'
import { Menu, Folder, FileText, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { triggerSync, getDocs } from '@/utils/api'

const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const [syncMsg, setSyncMsg] = React.useState('')
  const [docCount, setDocCount] = React.useState(0)

  React.useEffect(() => {
    (async () => {
      const list = await getDocs()
      setDocCount(Array.isArray(list) ? list.length : 0)
    })()
  }, [])

  return (
    <div>
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
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items中心 justify-center mx-auto mb-4">
                  <Menu className="w-6 h-6 text-purple-600 dark:text-purple-400" />
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
    </div>
  )
}

export default DashboardPage
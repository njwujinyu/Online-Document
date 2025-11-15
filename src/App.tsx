/*
版权声明 (c) 2025 Edi. 保留所有权利。
所有讨论与反馈请使用本仓库 Issues。
*/
import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import DocsPage from './pages/DocsPage'
import MyDocsPage from './pages/MyDocsPage'
import { useAuthStore } from './stores/authStore'
import AppLayout from './layouts/AppLayout'

function App() {
  const { isAuthenticated, init } = useAuthStore()

  React.useEffect(() => {
    init()
  }, [init])

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
      <Router>
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />} />
          <Route element={isAuthenticated ? <AppLayout /> : <LoginPage />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route path="/me" element={<MyDocsPage />} />
          </Route>
        </Routes>
      </Router>
    </div>
  )
}

export default App
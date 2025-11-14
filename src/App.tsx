/*
版权声明 (c) 2025 Edi. 保留所有权利。
所有讨论与反馈请使用本仓库 Issues。
*/
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import DocsPage from './pages/DocsPage'
import MyDocsPage from './pages/MyDocsPage'
import { useAuthStore } from './stores/authStore'

function App() {
  const { isAuthenticated, init } = useAuthStore()

  React.useEffect(() => {
    init()
  }, [init])

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
      <Router>
        <Routes>
          <Route 
            path="/login" 
            element={!isAuthenticated ? <LoginPage /> : <DashboardPage />} 
          />
          <Route 
            path="/" 
            element={isAuthenticated ? <DashboardPage /> : <LoginPage />} 
          />
          <Route 
            path="/docs" 
            element={isAuthenticated ? <DocsPage /> : <LoginPage />} 
          />
          <Route 
            path="/me" 
            element={isAuthenticated ? <MyDocsPage /> : <LoginPage />} 
          />
          
        </Routes>
      </Router>
    </div>
  )
}

export default App
